/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import { expect } from 'chai';
import Sinon from 'sinon';
import nock from 'nock';
import handleGithubWebhook from './handle-github-webhook';
import * as Config from './config';

const MOCK_DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/12345/s3creTk3Y';

describe('handleGithubWebhook', () => {
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
