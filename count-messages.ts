import Discord, { GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

import { getConfig } from './src/config';
import { getStatsCollection, initDb } from './src/db';
import { getWeekNumber } from './src/utils';

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
if (process.env.NODE_ENV !== 'test') {
  require('dotenv').config();
}

const API_URL = `https://discord.com/api/v9`;
const GUILD_ID = `440163731704643589`;

const personalToken = getConfig('PERSONAL_TOKEN');

async function init() {
  // Monday
  if (new Date().getDay() !== 1) {
    console.log('Not Monday – nothing to do here!');
    process.exit(0);
  }

  const client = new Discord.Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  });
  await client.login(getConfig('DISCORD_BOT_TOKEN'));

  const guild = await client.guilds.fetch(GUILD_ID);
  const members = await guild.members.fetch({});

  const db = await initDb();
  const statsCollection = getStatsCollection(db);

  const [year, week] = getWeekNumber(new Date());
  const yearWeek = `${year}-${week}`;

  await members.reduce(async (acc, member) => {
    await acc;

    const existingMember = await statsCollection.findOne({
      memberId: member.id,
    });
    if (existingMember && !existingMember.messagesCount) {
      // console.log(`Skipping… existing`);
      return acc;
    }

    const countedThisWeek = await statsCollection.count({
      memberId: member.id,
      yearWeek,
    });
    if (countedThisWeek) {
      // console.log(`Skipping… countedThisWeek`);
      return acc;
    }

    const messagesCount = await getMemberMessagesCount(member.id);
    if (!messagesCount) {
      // console.log(`Skipping… !messagesCount`);
      return acc;
    }

    const result = await statsCollection.updateOne(
      {
        memberId: member.id,
        yearWeek,
      },
      {
        $set: {
          memberId: member.id,
          memberName: member.displayName,
          messagesCount,
          updatedAt: new Date(),
          yearWeek,
        },
      },
      { upsert: true },
    );
    console.log({ memberId: member.id, memberName: member.displayName, messagesCount, result });
  }, Promise.resolve());
}

init()
  .then(() => {
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

type Response =
  | { readonly total_results?: number; readonly retry_after?: undefined }
  | { readonly total_results?: undefined; readonly retry_after: number };

export async function getMemberMessagesCount(memberId: string): Promise<number | undefined> {
  const res = await fetch(`${API_URL}/guilds/${GUILD_ID}/messages/search?author_id=${memberId}`, {
    headers: {
      authorization: personalToken,
    },
    method: 'GET',
  });
  const json = (await res.json()) as Response;

  if (json.retry_after) {
    console.log(json);
    await wait(json.retry_after * 1000);
    return getMemberMessagesCount(memberId);
  }

  // try to overcome rate limiting
  await wait(1000);
  return json.total_results;
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
