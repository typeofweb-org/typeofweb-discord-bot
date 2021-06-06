import type Discord from 'discord.js';

import { getKarmaCollection, initDb } from '../db';
import type { Command } from '../types';

export const KARMA_REGEX = /^(?<mention><@!(?<memberId>\d+)>)\s*\+\+\s*(?<description>.*)$/;

const karma: Command = {
  name: 'karma',
  description: 'Podziękowanie',
  args: false,
  cooldown: 10,
  async execute(msg: Discord.Message) {
    const result = KARMA_REGEX.exec(msg.content);
    if (!result?.groups) {
      return null;
    }
    console.log(msg.author.id);
    const { mention, memberId } = result.groups;

    const from = msg.author.id;
    const to = memberId;

    if (from === to) {
      return null;
    }

    const db = await initDb();
    const karmaCollection = getKarmaCollection(db);

    await karmaCollection.updateOne(
      {
        from,
        to,
      },
      {
        $set: {
          from,
          to,
          createdAt: new Date(),
        },
        $inc: { value: 1 },
      },
      { upsert: true },
    );

    const [agg] = await karmaCollection
      .aggregate([
        { $match: { to } },
        { $group: { _id: '$to', from: { $push: '$from' }, value: { $sum: '$value' } } },
      ])
      .toArray();

    return msg.channel.send(
      `${msg.author.toString()} podziękował ${mention}! Karma ${mention} wynosi ${
        agg.value
      } ${getEmojiForValue(agg.value)}`,
    );
  },
};

export default karma;

const getEmojiForValue = (value: number) => {
  const adjustedValue = Math.floor(Math.sqrt(value + 1) - 1);
  const idx = Math.min(karmaEmojis.length, adjustedValue);
  return karmaEmojis[idx];
};
const karmaEmojis = [
  '👋',
  '👍',
  '👌',
  '💪',
  '🎖',
  '🥉',
  '🥈',
  '🥇',
  '🏅',
  '🙌',
  '🥰',
  '😍',
] as const;
