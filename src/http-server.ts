import Http from 'http';

import type { Client } from 'discord.js';
import JsonParse from 'secure-json-parse';

import { handleGithubWebhook } from './handle-github-webhook';

const BAD_REQUEST = 400;
const OK = 200;

async function parseBody<T = object>(
  req: Http.IncomingMessage
): Promise<{ readonly rawBody: Buffer; readonly body: T }> {
  const chunks = [];
  // eslint-disable-next-line functional/no-loop-statement
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks);
  const body = JsonParse.parse(rawBody.toString()) as T;
  return { rawBody, body };
}

export function createHttpServer(
  discordClient: Client,
  // eslint-disable-next-line functional/prefer-readonly-type
  errors: (string | Error)[],
  // eslint-disable-next-line functional/prefer-readonly-type
  warnings: string[],
  // eslint-disable-next-line functional/prefer-readonly-type
  debugs: string[]
): Http.Server {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return Http.createServer(async (req, res) => {
    if (req.url?.startsWith('/githubWebhook')) {
      try {
        const { headers } = req;
        const { rawBody, body } = await parseBody(req);

        const { statusCode } = await handleGithubWebhook(headers, rawBody, body);

        res.statusCode = statusCode;
        res.end();
      } catch (error) {
        errors.push(String(error));
        res.statusCode = BAD_REQUEST;
        res.end();
      }

      return;
    }

    res.statusCode = OK;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ uptime: discordClient.uptime, errors, warnings, debugs }));
  });
}
