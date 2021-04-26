/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers no-let no-duplicate-imports */

import * as crypto from 'crypto';
import type Http from 'http';
import type { AddressInfo } from 'net';

import { expect } from 'chai';
import type Discord from 'discord.js';
import nock from 'nock';
import fetch from 'node-fetch';
import Sinon from 'sinon';

import * as Config from './config';
import { handleGithubWebhook } from './handle-github-webhook';
import * as handleGithubWebhookModule from './handle-github-webhook';
import { createHttpServer } from './http-server';

const GITHUB_WEBHOOK_SECRET = 's3creTk3Y';
const GITHUB_WEBHOOK_DISCORD_URL = 'https://discord.com/api/webhooks/12345/key';

describe('handleGithubWebhook - unit tests', () => {
  beforeEach(() => {
    const getConfigStub = Sinon.stub(Config, 'getConfig');
    getConfigStub.withArgs('GITHUB_WEBHOOK_SECRET').returns(GITHUB_WEBHOOK_SECRET);
    getConfigStub.withArgs('GITHUB_WEBHOOK_DISCORD_URL').returns(GITHUB_WEBHOOK_DISCORD_URL);
  });

  afterEach(() => {
    Sinon.restore();
  });

  it('should return 401 if webhook signature is invalid', async () => {
    const result = await handleGithubWebhook({}, Buffer.from(''), {});

    expect(result).to.eql({ statusCode: 401 });
  });

  it('should return 200 if webhook was filtered out', async () => {
    const result = await handleGithubWebhook(
      ...makeHandleGithubWebhookParams({
        sender: {
          login: 'dependabot[bot]',
        },
      })
    );

    expect(result).to.eql({ statusCode: 200 });
  });

  it('should return status code from discord if the webhook was forwarded', async () => {
    const payload = { sender: { login: 'kbkk' } };

    nock('https://discord.com').post('/api/webhooks/12345/key', payload).reply(599);

    const result = await handleGithubWebhook(...makeHandleGithubWebhookParams(payload));

    expect(result).to.eql({ statusCode: 599 });
  });
});

describe('handleGithubWebhook - integration tests', () => {
  let httpServer: Http.Server;
  let baseUrl: string;

  beforeEach(async () => {
    nock.cleanAll();
    nock.enableNetConnect();

    const discordClientMock = {
      uptime: 10,
    } as Discord.Client;

    httpServer = createHttpServer(discordClientMock, [], [], []);
    await new Promise<void>((resolve) => httpServer.listen(0, resolve));

    baseUrl = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
  });

  afterEach(() => {
    httpServer.close();
    Sinon.restore();
  });

  it('should respond with 400 on invalid request', async () => {
    const jsonParseSpy = Sinon.spy(JSON, 'parse');

    const { status } = await fetch(`${baseUrl}/githubWebhook`, {
      method: 'POST',
      body: 'invalid json',
    });

    expect(jsonParseSpy).to.throw();
    expect(status).to.eql(400);
  });

  it('should call handleGithubWebhook with headers, rawBody and body', async () => {
    const handleGithubWebhookStub = Sinon.stub(handleGithubWebhookModule, 'handleGithubWebhook');
    handleGithubWebhookStub.resolves({ statusCode: 200 });

    await fetch(`${baseUrl}/githubWebhook`, {
      method: 'POST',
      body: '{"a":1}',
      headers: {
        'x-hub-signature': 'test-signature',
      },
    });

    expect(handleGithubWebhookStub).to.have.been.calledOnceWithExactly(
      Sinon.match({ 'x-hub-signature': 'test-signature' }),
      Buffer.from('{"a":1}'),
      { a: 1 }
    );
  });

  it('should respond with status code from handleGithubWebhook', async () => {
    const handleGithubWebhookStub = Sinon.stub(handleGithubWebhookModule, 'handleGithubWebhook');
    handleGithubWebhookStub.resolves({ statusCode: 599 });

    const { status } = await fetch(`${baseUrl}/githubWebhook/test`, {
      method: 'POST',
      body: '{"a":1}',
    });

    expect(status).eql(599);
  });
});

function forgeSignature(rawBody: Buffer): string {
  const hmacString = crypto.createHmac('sha1', GITHUB_WEBHOOK_SECRET).update(rawBody).digest('hex');
  const signature = `sha1=${hmacString}`;

  return signature;
}

function makeHandleGithubWebhookParams(body: object): Parameters<typeof handleGithubWebhook> {
  const rawBody = Buffer.from(JSON.stringify(body));
  const signature = forgeSignature(rawBody);

  return [
    {
      'x-hub-signature': signature,
    },
    rawBody,
    body,
  ];
}
