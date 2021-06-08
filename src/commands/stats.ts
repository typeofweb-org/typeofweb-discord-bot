import type { Db } from 'mongodb';

import type { StatsCollection } from '../db';
import { getStatsCollection, initDb } from '../db';
import type { Command } from '../types';
import { getDateForWeekNumber, getWeekNumber } from '../utils';

const formatDate = (d: Date) =>
  String(d.getUTCFullYear()) +
  '-' +
  String(d.getUTCMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getUTCDate()).padStart(2, '0');

const stats: Command = {
  name: 'stats',
  description: 'Stats',
  args: false,
  permissions: 'ADMINISTRATOR',
  async execute(msg) {
    const db = await initDb();

    const { totalStats, statsChangeThisWeek, year1, year2, week1, week2 } =
      await getStatsChangeThisWeek(db);

    const d1 = formatDate(getDateForWeekNumber(year2, week2 + 1));
    const d2 = formatDate(getDateForWeekNumber(year1, week1 + 1));

    const ids = [
      ...new Set([
        ...totalStats.map(({ memberId }) => memberId),
        ...statsChangeThisWeek.map(({ memberId }) => memberId),
      ]),
    ];

    await Promise.allSettled(ids.map((memberId) => msg.guild?.members.fetch(memberId)));

    return msg.channel.send(
      [
        format(
          `Najbardziej aktywne w tym tygodniu (${d1} – ${d2}):`,
          statsChangeThisWeek.map((data) => ({
            ...data,
            displayName: msg.guild?.members.cache.get(data.memberId)?.displayName,
          })),
        ),
        '\n',
        format(
          'Najbardziej aktywne osoby od początku istnienia serwera:',
          totalStats.map((data) => ({
            ...data,
            displayName: msg.guild?.members.cache.get(data.memberId)?.displayName,
          })),
        ),
      ].join('\n'),
    );
  },
};

export default stats;

type Stats = {
  readonly memberId: string;
  readonly messagesCount: number;
  readonly displayName?: string;
};

function format(title: string, stats: readonly Stats[]) {
  const messages = [
    `**${title}**`,
    ...stats
      .slice(0, 10)
      .map(
        ({ messagesCount, displayName }, index) =>
          `\`${(index + 1).toString().padStart(2, ' ')}\`. ${displayName ?? ''} – ${
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
  const previousWeek = `${year2}-${week2}`;

  const [totalStats, statsThisWeek, statsPreviousWeek] = await Promise.all([
    statsCollection
      .find(
        {
          yearWeek: null,
        },
        { sort: { messagesCount: 'desc' } },
      )
      .toArray(),

    statsCollection.find({ yearWeek: thisWeek }).toArray(),

    statsCollection.find({ yearWeek: previousWeek }).toArray(),
  ]);

  const totalStatsById = resultToMessagesByMemberId(totalStats);
  const statsPreviousWeekById = resultToMessagesByMemberId(statsPreviousWeek);

  const statsChangeThisWeek = statsThisWeek
    .map(({ memberId, messagesCount }) => {
      if (!messagesCount) {
        return null;
      }

      const messagesCountDifference =
        messagesCount - (statsPreviousWeekById[memberId] ?? totalStatsById[memberId] ?? 0);

      return { memberId, messagesCount: messagesCountDifference };
    })
    .filter((obj): obj is Stats => !!obj)
    .sort((a, b) => b.messagesCount - a.messagesCount);

  return {
    statsChangeThisWeek: statsChangeThisWeek.slice(0, 10),
    totalStats: totalStats.slice(0, 10) as readonly Stats[],
    year1,
    year2,
    week1,
    week2,
  };
}

function resultToMessagesByMemberId(stats: readonly StatsCollection[]) {
  return stats.reduce<Record<StatsCollection['memberId'], StatsCollection['messagesCount']>>(
    (acc, { memberId, messagesCount }) => {
      acc[memberId] = messagesCount;
      return acc;
    },
    {},
  );
}
