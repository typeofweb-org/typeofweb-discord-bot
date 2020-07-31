import Discord from 'discord.js';
import DiscordRSS from 'discord.rss';

import { handleCommand } from './commands';
import { getConfig } from './config';
import { InvalidUsageError } from './types';
import createHttpServer from './http-server';

import Cache from 'node-cache';
const ONE_HOUR_S = 3600;
const cache = new Cache({ stdTTL: ONE_HOUR_S });

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

function isCommand(msg: Discord.Message) {
  return msg.content.startsWith(getConfig('PREFIX'));
}

client.on('message', async (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content === `(╯°□°）╯︵ ┻━┻`) {
    return msg.channel.send(`┬─┬ノ( ◕◡◕ ノ)`);
  }

  if (isCommand(msg)) {
    try {
      const collector = msg.channel.createMessageCollector(
        (m: Discord.Message) => m.author.id === client.user.id
      );
      await handleCommand(msg);
      const ids = collector.collected.map((m) => m.id);
      cache.set(msg.id, ids);
      collector.stop();
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

async function revertCommand(msg: Discord.Message) {
  if (!cache.has(msg.id)) {
    return undefined;
  }
  const messagesToDelete = cache.get<string[]>(msg.id)!;
  return msg.channel.bulkDelete(messagesToDelete);
}

client.on('messageDelete', async (msg) => {
  if (msg.author.bot) {
    return;
  }

  if (isCommand(msg)) {
    try {
      await revertCommand(msg);
    } catch (err) {
      errors.push(err);
    }
  }

  return;
});

async function init() {
  await client.login(getConfig('DISCORD_BOT_TOKEN'));
  drss._defineBot(client);
}

init().catch((err) => errors.push(err));

const httpServer = createHttpServer(client, errors, warnings, debugs);

httpServer.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);
});
