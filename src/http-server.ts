import Http from 'http';
import handleGithubWebhook from './handle-github-webhook';
import type { Client } from 'discord.js';

const BAD_REQUEST = 400;
const OK = 200;

function createHttpServer(
  discordClient: Client,
  errors: Error[],
  warnings: string[],
  debugs: string[]
) {
  return Http.createServer(async (req, res) => {
    if (req.url?.startsWith('/githubWebhook')) {
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }

      try {
        const body = JSON.parse(Buffer.concat(chunks).toString());

        const { statusCode } = await handleGithubWebhook(req.url, body);

        res.statusCode = statusCode;
        res.end();
      } catch (error) {
        console.log(error);
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
