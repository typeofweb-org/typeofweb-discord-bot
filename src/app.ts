import Discord, { GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';
import MonitoRSS from 'monitorss';
import type { ClientConfig } from 'monitorss';
import Cache from 'node-cache';

import { handleCommand, handleSlashCommand, legacyCommandsToSlashCommands } from './commands';
import { KARMA_REGEX } from './commands/karma';
import { messageToReflinks } from './commands/reflink';
import { getConfig } from './config';
import { updateKarmaRoles } from './cron/roles/karma';
import { updateStatsRoles } from './cron/roles/stats';
import { getStatsCollection, initDb } from './db';
import { createHttpServer } from './http-server';
import { thx } from './thx';
import { InvalidUsageError } from './types';
import { getWeekNumber, wrapErr } from './utils';

const MESSAGE_COLLECTOR_CACHE_S = 60 * 60;
const messageCollectorCache = new Cache({ stdTTL: MESSAGE_COLLECTOR_CACHE_S });

const client = new Discord.Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

const settings: { readonly setPresence: boolean; readonly config: ClientConfig } = {
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
  console.log(`Logged in as ${client.user?.tag!}!`);
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
  return msg.content.startsWith(getConfig('PREFIX')) || KARMA_REGEX.test(msg.content);
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  try {
    await handleSlashCommand(interaction);
  } catch (err) {
    console.error(err);
  }
});

// const ROLE_MUTED_NAME = 'muted' as const;
// const MAX_MENTIONS_PER_MESSAGE = 10;

client.on('messageCreate', async (msg) => {
  if (msg.author.bot) {
    return;
  }

  // if ((msg.mentions.members?.size ?? 0) > MAX_MENTIONS_PER_MESSAGE) {
  //   const roleManager = await msg.guild?.roles.fetch();
  //   const roleMuted = roleManager?.cache.find((v) => v.name === ROLE_MUTED_NAME);
  //   console.log(roleMuted);
  //   // if (roleMuted) {
  //   //   msg.member?.roles.add(roleMuted);
  //   // }
  // }

  if (msg.content === `(╯°□°）╯︵ ┻━┻`) {
    await msg.channel.send(`┬─┬ノ( ◕◡◕ ノ)`);
    return;
  }

  if (isCommand(msg)) {
    try {
      const collector = msg.channel.createMessageCollector({
        filter: (m: Discord.Message) => m.author.id === client.user?.id,
      });
      await handleCommand(msg);
      const ids = collector.collected.map((m) => m.id);
      messageCollectorCache.set(msg.id, ids);
      collector.stop();
    } catch (err) {
      if (err instanceof InvalidUsageError) {
        void msg.reply(err.message);
      } else {
        console.error(err);
        void msg.reply('przepraszam, ale coś poszło nie tak…');
      }
    }
  }

  void updateMessagesCount(msg.member?.id, msg.member?.displayName).catch(console.error);

  const maybeReflinks = messageToReflinks(msg.content);
  if (maybeReflinks.length > 0) {
    await msg.reply(maybeReflinks.join('\n'));
    return;
  }

  await thx(msg);

  return;
});

async function updateMessagesCount(
  memberId: Discord.GuildMember['id'] | undefined,
  displayName: Discord.GuildMember['displayName'] | undefined,
) {
  const db = await initDb();
  const statsCollection = getStatsCollection(db);
  const [year, week] = getWeekNumber(new Date());
  const yearWeek = `${year}-${week}`;

  await statsCollection.updateOne(
    {
      memberId,
      yearWeek,
    },
    {
      $set: {
        memberId,
        memberName: displayName,
        updatedAt: new Date(),
        yearWeek,
      },
      $inc: { messagesCount: 1 },
    },
    { upsert: true },
  );
}

function revertCommand(msg: Discord.Message) {
  if (!messageCollectorCache.has(msg.id) || msg.channel.type === Discord.ChannelType.DM) {
    return undefined;
  }
  // eslint-disable-next-line functional/prefer-readonly-type
  const messagesToDelete = messageCollectorCache.get<string[]>(msg.id)!;
  return msg.channel.bulkDelete(messagesToDelete);
}

client.on('messageDelete', async (msg) => {
  if (msg.author?.bot || !msg.content) {
    return;
  }

  const message = msg as Discord.Message;

  if (isCommand(message)) {
    try {
      await revertCommand(message);
    } catch (err) {
      errors.push(wrapErr(err));
    }
  }

  return;
});

async function init() {
  const rest = new REST({ version: '10' }).setToken(getConfig('DISCORD_BOT_TOKEN'));

  const TYPE_OF_WEB_GUILD_ID = '440163731704643589';

  try {
    await rest.put(
      Routes.applicationGuildCommands(getConfig('DISCORD_CLIENT_ID'), TYPE_OF_WEB_GUILD_ID),
      {
        body: legacyCommandsToSlashCommands(),
      },
    );
  } catch (err) {
    console.error(err);
  }

  await client.login(getConfig('DISCORD_BOT_TOKEN'));

  // Auto assign roles
  {
    const guild = await client.guilds.fetch(TYPE_OF_WEB_GUILD_ID);
    void updateRoles(guild);
    setInterval(() => {
      void updateRoles(guild);
    }, 1000 * 60 * 60 * 24 * 1);
  }

  if (process.env.NODE_ENV === 'production') {
    const rssClient = new MonitoRSS.ClientManager(settings);
    await new Promise((resolve) => rssClient.start(() => resolve(undefined)));
    console.log('MonitoRSS started!');
  }
}

init().catch((err) => errors.push(wrapErr(err)));

const httpServer = createHttpServer(client, errors, warnings, debugs);

const updateRoles = async (guild: Discord.Guild) => {
  try {
    await updateStatsRoles(guild);
    await updateKarmaRoles(guild);
    console.log(`Updated roles`);
  } catch (err) {
    errors.push(wrapErr(err));
  }
};

httpServer.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);
});
