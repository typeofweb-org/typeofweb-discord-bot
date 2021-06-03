import Discord, { Intents } from 'discord.js';
import { MongoClient } from 'mongodb';
import fetch from 'node-fetch';

import { getConfig } from './src/config';

/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env' });
} else {
  require('dotenv').config({ path: '.env.dev' });
}

const API_URL = `https://discord.com/api/v9`;
const GUILD_ID = `440163731704643589`;

const personalToken = getConfig('PERSONAL_TOKEN');

async function init() {
  const intents = new Intents([
    Intents.NON_PRIVILEGED, // include all non-privileged intents, would be better to specify which ones you actually need
    'GUILD_MEMBERS', // lets you request guild members (i.e. fixes the issue)
  ]);
  const client = new Discord.Client({ ws: { intents } });
  await client.login(getConfig('DISCORD_BOT_TOKEN'));

  const guild = await client.guilds.fetch(GUILD_ID);
  const members = await guild.members.fetch({ limit: 100 });

  const mongoUrl = getConfig('MONGO_URL');
  const dbName = mongoUrl.split('/').pop();
  const mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  const statsCollection = db.collection('stats');

  await members.reduce(async (acc, member) => {
    await acc;
    const messagesCount = await getMemberMessagesCount(member.id);
    const result = await statsCollection.updateOne(
      { memberId: member.id },
      {
        $set: {
          memberId: member.id,
          memberName: member.displayName,
          messagesCount,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    console.log({ memberId: member.id, memberName: member.displayName, messagesCount, result });
  }, Promise.resolve());
  // console.log({ guild: guild.toJSON() });
  // console.log(guild.members.cache.toJSON());
  // await guild.members.fetch({ force: true });
  // console.log({ members: members.toJSON() });

  process.exit(0);
}

init().catch((err) => console.error(err));

type Response =
  | { readonly total_results?: number; readonly retry_after?: undefined }
  | { readonly total_results?: undefined; readonly retry_after: number };

async function getMemberMessagesCount(memberId: string): Promise<number | undefined> {
  const res = await fetch(
    `${API_URL}/guilds/440163731704643589/messages/search?author_id=${memberId}`,
    {
      headers: {
        authorization: personalToken,
      },
      method: 'GET',
    },
  );
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
