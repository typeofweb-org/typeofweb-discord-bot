import type Discord from 'discord.js';
import type { Db } from 'mongodb';

import { getKarmaCollection, initDb } from '../db';
import type { Command } from '../types';
import { InvalidUsageError } from '../types';

export const KARMA_REGEX = /^(?<mention><@!?(?<memberId>\d{17,19})>)\s*\+\+\s*(?<description>.*)$/;

const addKarma: Command = {
  name: 'addKarma',
  description: 'Podziękuj użytkownikom wpisując `@nazwa ++`',
  args: false,
  cooldown: 10,
  async execute(msg: Discord.Message) {
    console.log(msg.content);
    const member = await msg.mentions.members?.first()?.fetch();
    if (!member) {
      return null;
    }

    const from = msg.author.id;
    const to = member.id;

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

    const agg = await getKarmaForMember(to, db);
    const value = agg?.value ?? 0;

    return msg.channel.send(
      `${msg.author.toString()} podziękował ${member.toString()}! Karma ${member.toString()} wynosi ${value} ${getEmojiForValue(
        value,
      )}`,
    );
  },
};

const karma: Command = {
  name: 'karma',
  description: 'Sprawdź ile kto ma pkt. karmy.',
  args: true,
  async execute(msg) {
    const member = await msg.mentions.members?.first()?.fetch();
    if (!member) {
      throw new InvalidUsageError(`Podaj nazwę użytkownika.`);
    }

    const db = await initDb();
    const agg = await getKarmaForMember(member.id, db);
    const value = agg?.value ?? 0;

    return msg.channel.send(
      `${member.displayName} ma ${value} punktów karmy ${getEmojiForValue(value)}`,
    );
  },
};

export { addKarma, karma };

const getKarmaForMember = async (memberId: string, db: Db) => {
  const karmaCollection = getKarmaCollection(db);

  type KarmaAgg = {
    readonly _id: string;
    readonly from: readonly string[];
    readonly value: number;
  };

  const [agg] = await karmaCollection
    .aggregate<KarmaAgg | undefined>([
      { $match: { to: memberId } },
      { $group: { _id: '$to', from: { $push: '$from' }, value: { $sum: '$value' } } },
    ])
    .toArray();
  return agg;
};

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
