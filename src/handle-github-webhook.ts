import * as crypto from 'crypto';
import { IncomingHttpHeaders } from 'http';
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
  headers: IncomingHttpHeaders,
  rawBody: Buffer,
  body: object
): Promise<{ statusCode: number }> {
  if (!validateGithubSignature((headers['x-hub-signature'] ?? '') as string, rawBody)) {
    return { statusCode: 401 };
  }

  if (!shouldSendWebhook(body)) {
    return { statusCode: 200 };
  }

  const discordWebhookUrl = getConfig('GITHUB_WEBHOOK_DISCORD_URL');

  const { status } = await fetch(discordWebhookUrl, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  return { statusCode: status };
}

function shouldSendWebhook(body: object | GithubWebhookPullRequest) {
  if ('sender' in body && SENDER_LOGIN_BLOCKLIST.includes(body.sender?.login)) {
    return false;
  }

  return true;
}

function validateGithubSignature(receivedSignature: string, rawBody: Buffer) {
  const githubSecret = getConfig('GITHUB_WEBHOOK_SECRET');
  const hmacString = crypto.createHmac('sha1', githubSecret).update(rawBody).digest('hex');
  const expectedSignature = `sha1=${hmacString}`;

  return (
    receivedSignature.length === expectedSignature.length &&
    crypto.timingSafeEqual(Buffer.from(receivedSignature), Buffer.from(expectedSignature))
  );
}

export default handleGithubWebhook;
