import Http from 'http';
import handleGithubWebhook from './handle-github-webhook';
import type { Client } from 'discord.js';
import JsonParse from 'secure-json-parse';

const BAD_REQUEST = 400;
const OK = 200;

async function parseBody<T = object>(
  req: Http.IncomingMessage
): Promise<{ rawBody: Buffer; body: T }> {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBody = Buffer.concat(chunks);
  const body = JsonParse.parse(rawBody.toString()) as T;
  return { rawBody, body };
}

function createHttpServer(
  discordClient: Client,
  errors: Error[],
  warnings: string[],
  debugs: string[]
): Http.Server {
  return Http.createServer(async (req, res) => {
    if (req.url?.startsWith('/githubWebhook')) {
      try {
        const { headers } = req;
        const { rawBody, body } = await parseBody(req);

        const { statusCode } = await handleGithubWebhook(headers, rawBody, body);

        res.statusCode = statusCode;
        res.end();
      } catch (error) {
        errors.push(error.message ?? error);
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

export default createHttpServer;
