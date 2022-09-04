import type { Db } from 'mongodb';

import { getStatsCollection, initDb } from '../db';
import type { Command } from '../types';
import { getDateForWeekNumber, getWeekNumber } from '../utils';

const formatDate = (d: Date) =>
  String(d.getFullYear()) +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');

const stats: Command = {
  name: 'stats',
  description: 'Stats',
  args: 'prohibited',
  permissions: 'Administrator',
  async execute(msg) {
    const db = await initDb();

    const { totalStats, statsThisWeek, year1, week1 } = await getStatsChangeThisWeek(db);

    // Monday
    const d1 = getDateForWeekNumber(year1, week1);
    d1.setUTCDate(d1.getUTCDate() - (d1.getUTCDay() || 7));

    // Sunday
    const d2 = new Date(d1);
    d2.setUTCDate(d2.getUTCDate() + 6);

    return msg.channel.send(
      [
        format(
          `Najbardziej aktywne osoby w tym tygodniu (${formatDate(d1)} – ${formatDate(d2)}):`,
          statsThisWeek,
        ),
        '\n',
        format('Najbardziej aktywne osoby od początku istnienia serwera:', totalStats),
      ].join('\n'),
    );
  },
};

export default stats;

function format(
  title: string,
  stats: readonly { readonly messagesCount?: number | null; readonly memberName?: string | null }[],
) {
  const messages = [
    `**${title}**`,
    ...stats
      .filter((d) => d.messagesCount)
      .map(
        ({ messagesCount, memberName }, index) =>
          `\`${(index + 1).toString().padStart(2, ' ')}\`. ${memberName ?? ''} – ${
            messagesCount ?? 0
          }`,
      ),
  ];
  return messages.join('\n');
}

async function getStatsChangeThisWeek(db: Db) {
  const statsCollection = getStatsCollection(db);

  const now = new Date();
  const [year1, week1] = getWeekNumber(now);
  const thisWeek = `${year1}-${week1}`;

  now.setDate(now.getDate() - 7);
  const [year2, week2] = getWeekNumber(now);

  const statsThisWeekPromise = statsCollection
    .find({ yearWeek: thisWeek })
    .sort({ messagesCount: -1 })
    .limit(10)
    .toArray();

  // @todo should aggregate and sum
  const totalStatsPromise = getStats(db);

  const [statsThisWeek, totalStats] = await Promise.all([statsThisWeekPromise, totalStatsPromise]);

  return {
    statsThisWeek,
    totalStats,
    year1,
    year2,
    week1,
    week2,
  };
}

export type StatsAgg = {
  readonly _id: string;
  readonly messagesCount: number;
  readonly memberName: string;
};

const statsAggregation = [
  {
    $group: {
      _id: '$memberId',
      messagesCount: { $sum: '$messagesCount' },
      memberName: { $push: '$memberName' },
    },
  },
  { $sort: { messagesCount: -1 } },
  { $limit: 10 },
  { $addFields: { memberName: { $arrayElemAt: [{ $reverseArray: '$memberName' }, 0] } } },
];

export const getStats = async (db: Db) => {
  const statsCollection = getStatsCollection(db);

  const agg = await statsCollection.aggregate<StatsAgg>(statsAggregation).toArray();
  return agg;
};
