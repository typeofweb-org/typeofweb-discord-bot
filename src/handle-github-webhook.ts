import fetch from 'node-fetch';
import { getConfig } from './config';

const SENDER_LOGIN_BLOCKLIST = ['dependabot', 'dependabot-preview'];

// see https://developer.github.com/webhooks/event-payloads/ for full github webhooks reference

interface GithubWebhookSender {
  login: string;
}

interface GithubWebhookPullRequest {
  sender: GithubWebhookSender;
}

async function handleGithubWebhook(
  requestPath: string,
  body: object
): Promise<{ statusCode: number }> {
  if (!checkWebhookSecret(requestPath)) {
    return { statusCode: 401 };
  }

  if (!shouldSendWebhook(body)) {
    return { statusCode: 200 };
  }

  const discordWebhookUrl = getConfig('DISCORD_RECEIVE_GITHUB_WEBHOOK_URL');

  const { status } = await fetch(discordWebhookUrl);

  return { statusCode: status };
}

function shouldSendWebhook(body: object | GithubWebhookPullRequest) {
  if ('sender' in body && SENDER_LOGIN_BLOCKLIST.includes(body.sender?.login)) {
    return false;
  }

  return true;
}

/**
 * Given the configured webhook url is https://discord.com/api/webhooks/12345/s3creTk3Y
 * then the bot should be called with https://tow-bot/githubWebhook/s3creTk3Y
 */
function checkWebhookSecret(requestPath: string): boolean {
  const discordWebhookUrl = getConfig('DISCORD_RECEIVE_GITHUB_WEBHOOK_URL');

  const secret = discordWebhookUrl.split('/').pop() ?? '';

  return requestPath.includes(secret);
}

export default handleGithubWebhook;
