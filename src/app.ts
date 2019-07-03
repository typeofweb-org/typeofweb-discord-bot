import Discord from 'discord.js';
import DiscordRSS from 'discord.rss';
import Http from 'http';

import { handleCommand } from './commands';
import { getConfig } from './config';
import { InvalidUsageError } from './types';

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
client.on('error', error => {
  errors.push(error);
});

const warnings: string[] = [];
client.on('warn', warning => {
  warnings.push(warning);
});

client.on('message', async msg => {
  if (msg.author.bot) {
    return;
  }

  if (msg.content === `(╯°□°）╯︵ ┻━┻`) {
    return msg.channel.send(`┬─┬ノ( ◕◡◕ ノ)`);
  }

  if (/mango/i.test(msg.content)) {
    return msg.channel.send(` Here is your mango: https://i.imgur.com/OJzN2SO.png`);
  }

  if (msg.content.startsWith(getConfig('PREFIX'))) {
    try {
      await handleCommand(msg);
    } catch (err) {
      if (err instanceof InvalidUsageError) {
        void msg.reply(err.message);
      } else {
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

void init();

const server = Http.createServer((_req, res) => {
  // tslint:disable-next-line:no-magic-numbers
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ errors, warnings }));
});

server.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);
});
