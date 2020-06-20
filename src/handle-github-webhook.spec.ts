/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers no-let no-duplicate-imports */

import { expect } from 'chai';
import Sinon from 'sinon';
import nock from 'nock';
import Http from 'http';
import { promisify } from 'util';
import { AddressInfo } from 'net';
import Discord from 'discord.js';
import fetch from 'node-fetch';
import handleGithubWebhook from './handle-github-webhook';
import * as handleGithubWebhookModule from './handle-github-webhook';
import * as Config from './config';
import createHttpServer from './http-server';

const MOCK_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/12345/s3creTk3Y';

describe('handleGithubWebhook - unit tests', () => {
  beforeEach(() => {
    Sinon.stub(Config, 'getConfig').returns(MOCK_DISCORD_WEBHOOK_URL);
  });

  afterEach(() => {
    Sinon.restore();
  });

  it('should return 401 if webhook secret is not provided', async () => {
    const result = await handleGithubWebhook('/githubWebhook/wrong-secret', {});

    expect(result).to.eql({ statusCode: 401 });
  });

  it('should return 200 if webhook was filtered out', async () => {
    const result = await handleGithubWebhook('/githubWebhook/s3creTk3Y', {
      sender: {
        login: 'dependabot',
      },
    });

    expect(result).to.eql({ statusCode: 200 });
  });

  it('should return status code from discord if the webhook was forwarded', async () => {
    nock('https://discord.com').get('/api/webhooks/12345/s3creTk3Y').reply(599);

    const result = await handleGithubWebhook('/githubWebhook/s3creTk3Y', {});

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
    await promisify(httpServer.listen.bind(httpServer))(0);

    baseUrl = `http://localhost:${(httpServer.address() as AddressInfo).port}`;
  });

  afterEach(() => {
    httpServer.close();
    Sinon.restore();
  });

  it('should respond with 400 on invalid request', async () => {
    const jsonParseSpy = Sinon.spy(JSON, 'parse');

    const { status } = await fetch(`${baseUrl}/githubWebhook/test`, {
      method: 'POST',
      body: 'invalid json',
    });

    expect(jsonParseSpy).to.throw();
    expect(status).to.eql(400);
  });

  it('should call handleGithubWebhook with url and body', async () => {
    const handleGithubWebhookStub = Sinon.stub(handleGithubWebhookModule, 'default');
    handleGithubWebhookStub.resolves({ statusCode: 200 });

    await fetch(`${baseUrl}/githubWebhook/test`, {
      method: 'POST',
      body: '{"a":1}',
    });

    expect(handleGithubWebhookStub).to.have.been.calledOnceWithExactly('/githubWebhook/test', {
      a: 1,
    });
  });

  it('should respond with status code from handleGithubWebhook', async () => {
    const handleGithubWebhookStub = Sinon.stub(handleGithubWebhookModule, 'default');
    handleGithubWebhookStub.resolves({ statusCode: 599 });

    const { status } = await fetch(`${baseUrl}/githubWebhook/test`, {
      method: 'POST',
      body: '{"a":1}',
    });

    expect(status).eql(599);
  });
});
