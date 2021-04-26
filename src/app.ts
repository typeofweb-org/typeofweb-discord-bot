import Discord from 'discord.js';
import MonitoRSS from 'monitorss';
import Cache from 'node-cache';

import { handleCommand } from './commands';
import { getConfig } from './config';
import { createHttpServer } from './http-server';
import { InvalidUsageError } from './types';

const ONE_HOUR_S = 3600;
const cache = new Cache({ stdTTL: ONE_HOUR_S });

const client = new Discord.Client();

const settings = {
  setPresence: true,
  config: {
    bot: {
      token: getConfig('DISCORD_BOT_TOKEN'),
    },
    database: {
      uri: getConfig('MONGO_URL'),
      connection: {
        useNewUrlParser: true,
      },
    },
    feeds: {
      refreshRateMinutes: 10,
      timezone: 'Europe/Warsaw',
      dateFormat: 'LLL',
      dateLanguage: 'pl',
      dateLanguageList: ['pl'],
      sendFirstCycle: true,
      cycleMaxAge: 5,
    },
  },
};

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// eslint-disable-next-line functional/prefer-readonly-type
const errors: Error[] = [];
client.on('error', (error) => {
  errors.push(error);
});

// eslint-disable-next-line functional/prefer-readonly-type
const warnings: string[] = [];
client.on('warn', (warning) => {
  warnings.push(warning);
});

// eslint-disable-next-line functional/prefer-readonly-type
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
        (m: Discord.Message) => m.author.id === client.user.id,
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
      return msg.channel.stopTyping(true);
    }
  }

  return;
});

function revertCommand(msg: Discord.Message) {
  if (!cache.has(msg.id)) {
    return undefined;
  }
  // eslint-disable-next-line functional/prefer-readonly-type
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
  const rssClient = new MonitoRSS.ClientManager(settings);
  rssClient.start();
}

init().catch((err) => errors.push(err));

const httpServer = createHttpServer(client, errors, warnings, debugs);

httpServer.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);
});
