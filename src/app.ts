import Discord from 'discord.js';
import MonitoRSS from 'monitorss';
import type { ClientConfig } from 'monitorss';
import Cache from 'node-cache';

import { handleCommand } from './commands';
import { KARMA_REGEX } from './commands/karma';
import { getConfig } from './config';
import { createHttpServer } from './http-server';
import { InvalidUsageError } from './types';
import { getWeekNumber } from './utils';
import { getStatsCollection, initDb } from './db';
import { updateKarmaRoles } from './cron/roles';
import { messageToReflinks } from './commands/reflink';

const MESSAGE_COLLECTOR_CACHE_S = 60 * 60;
const messageCollectorCache = new Cache({ stdTTL: MESSAGE_COLLECTOR_CACHE_S });

const THX_TIMEOUT_S = 15 * 60;
const thxTimeoutCache = new Cache({ stdTTL: THX_TIMEOUT_S });

const client = new Discord.Client();

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
  console.log(`Logged in as ${client.user?.tag}!`);
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

// const ROLE_MUTED_NAME = 'muted' as const;
// const MAX_MENTIONS_PER_MESSAGE = 10;

client.on('message', async (msg) => {
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
    return msg.channel.send(`┬─┬ノ( ◕◡◕ ノ)`);
  }

  if (isCommand(msg)) {
    try {
      const collector = msg.channel.createMessageCollector(
        (m: Discord.Message) => m.author.id === client.user?.id,
      );
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
    } finally {
      return msg.channel.stopTyping(true);
    }
  }

  void updateMessagesCount(msg.member?.id, msg.member?.displayName).catch(console.error);

  const maybeReflinks = messageToReflinks(msg.content);
  if (maybeReflinks.length > 0) {
    return msg.reply(maybeReflinks);
  }

  if (/thx|thank|dzięki|dziękuję|dzieki|dziekuje/i.test(msg.content)) {
    if (
      (thxTimeoutCache.get<Date>(msg.channel.id)?.getTime() ?? 0) <
      Date.now() - THX_TIMEOUT_S * 1000
    ) {
      thxTimeoutCache.set(msg.channel.id, new Date());
      return msg.reply('protip: napisz `@nazwa ++`, żeby komuś podziękować!');
    }
  }

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
  if (!messageCollectorCache.has(msg.id) || msg.channel.type === 'dm') {
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
      errors.push(err);
    }
  }

  return;
});

async function init() {
  await client.login(getConfig('DISCORD_BOT_TOKEN'));
  if (process.env.NODE_ENV === 'production') {
    const rssClient = new MonitoRSS.ClientManager(settings);
    await new Promise((resolve) => rssClient.start(() => resolve(undefined)));
    console.log('MonitoRSS started!');
  }
}

init().catch((err) => errors.push(err));

const httpServer = createHttpServer(client, errors, warnings, debugs);

const updateRoles = () => {
  updateKarmaRoles()
    .then(() => console.log(`Successfully updated roles`))
    .catch((err) => errors.push(err));
};

httpServer.listen(getConfig('PORT'), () => {
  console.log(`Server running!`);

  updateRoles();
  setInterval(() => {
    updateRoles();
  }, 1000 * 60 * 60 * 24 * 1);
});
