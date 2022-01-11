import type { Db } from 'mongodb';

import { getKarmaCollection } from '../db';

export type KarmaAgg = {
  readonly _id: string;
  readonly from: readonly string[];
  readonly value: number;
};

const RATE_OF_DECAY = 1000 * 60 * 60 * 24 * (365 / 6); // half every two months

const karmaAggregateGroup = [
  {
    $project: {
      to: '$to',
      from: '$from',
      value: {
        $multiply: [
          '$value',
          { $exp: { $divide: [{ $subtract: ['$createdAt', new Date()] }, RATE_OF_DECAY] } },
        ],
      },
    },
  },
  { $group: { _id: '$to', from: { $push: '$from' }, value: { $sum: '$value' } } },
] as const;

export const getKarmaForMember = async (memberId: string, db: Db) => {
  const karmaCollection = getKarmaCollection(db);

  const [agg] = await karmaCollection
    .aggregate<KarmaAgg | undefined>([{ $match: { to: memberId } }, ...karmaAggregateGroup])
    .toArray();
  return agg;
};

export const getKarmaForMembers = async (db: Db, memberIds: string[]) => {
  const karmaCollection = getKarmaCollection(db);

  const agg = await karmaCollection
    .aggregate<KarmaAgg>([{ $match: { to: { $in: memberIds } } }, ...karmaAggregateGroup])
    .sort({ value: -1 })
    .limit(10)
    .toArray();
  return agg;
};

export const getKarmaForAllMembers = async (db: Db) => {
  const karmaCollection = getKarmaCollection(db);

  const agg = await karmaCollection
    .aggregate<KarmaAgg>([...karmaAggregateGroup])
    .sort({ value: -1 })
    .limit(10)
    .toArray();
  return agg;
};

export const getEmojiForKarmaValue = (value: number) => {
  const adjustedValue = Math.floor(Math.sqrt(value + 1) - 1);
  const idx = Math.min(karmaEmojis.length - 1, adjustedValue);
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
