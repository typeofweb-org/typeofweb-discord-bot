import Discord from 'discord.js';
import DiscordRSS from 'discord.rss';
import Http from 'http';

import { handleCommand } from './commands';
import { getConfig } from './config';
import { InvalidUsageError } from './types';
import handleGithubWebhook from './handle-github-webhook';

const client = new Discord.Client();
const drss = new DiscordRSS.Client({
  database: {
    uri: getConfig('MONGO_URL'),
    connection: {
      useNewUrlParser: true,
    },
  },
  feeds: {
    refreshTimeMinutes: 10,
    timezone: 'Europe/Warsaw',
    dateFormat: 'LLL',
    dateLanguage: 'pl',
    dateLanguageList: ['pl'],
    sendOldOnFirstCycle: true,
    cycleMaxAge: 5,
  },
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

const errors: Error[] = [];
client.on('error', (error) => {
  errors.push(error);
});

const warnings: string[] = [];
client.on('warn', (warning) => {
  warnings.push(warning);
});

const debugs: string[] = [];
const MAX_DEBUG_LENGTH = 100;
client.on('debug', (debug) => {
  debugs.push(debug.replace(getConfig('DISCORD_BOT_TOKEN'), 'DISCORD_BOT_TOKEN'));
  if (debugs.length > MAX_DEBUG_LENGTH) {
    debugs.shift();
  }
});

client.on('message', async (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content === `(╯°□°）╯︵ ┻━┻`) {
    return msg.channel.send(`┬─┬ノ( ◕◡◕ ノ)`);
  }

  if (msg.content.startsWith(getConfig('PREFIX'))) {
    try {
      await handleCommand(msg);
    } catch (err) {
      if (err instanceof InvalidUsageError) {
        void msg.reply(err.message);
      } else {
        console.error(err);
        void msg.reply('przepraszam, ale coś poszło nie tak…');
      }
    } finally {
      await msg.channel.stopTyping(true);
    }
  }

  return;
});

async function init() {
  await client.login(getConfig('DISCORD_BOT_TOKEN'));
  drss._defineBot(client);
}

init().catch((err) => errors.push(err));

const server = Http.createServer(async (_req, res) => {
  if (_req.url?.startsWith('/githubWebhook')) {
    const chunks = [];
    for await (let chunk of _req) {
      chunks.push(chunk);
    }

    try {
      const body = JSON.parse(Buffer.concat(chunks).toString());

      const { statusCode } = await handleGithubWebhook(_req.url, body);

      res.statusCode = statusCode;
      res.end();
    } catch (error) {
      console.log(error);
      res.statusCode = 400;
      res.end();
    }

    return;
  }

  // tslint:disable-next-line:no-magic-numbers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ uptime: client.uptime, errors, warnings, debugs }));
});

server.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);
});
