import Discord from 'discord.js';
import DiscordRSS from 'discord.rss';
import Http from 'http';

import { handleCommand } from './commands';
import { getConfig } from './config';

const PREFIX = '!';
const client = new Discord.Client();
const drss = new DiscordRSS.Client({
  database: {
    uri: getConfig('MONGO_URL'),
    connection: {
      useNewUrlParser: true,
    },
  },
  feeds: {
    refreshTimeMinutes: 1,
    timezone: 'Europe/Warsaw',
    dateFormat: 'LLL',
    dateLanguage: 'pl',
    dateLanguageList: ['pl'],
    sendOldOnFirstCycle: true,
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

const debugs: string[] = [];
client.on('debug', debug => {
  debugs.push(debug);
});

client.on('message', msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) {
    return;
  }
  handleCommand(msg);
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
