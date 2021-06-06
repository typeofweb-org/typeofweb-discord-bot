import type { Db } from 'mongodb';

import type { StatsCollection } from '../db';
import { getStatsCollection, initDb } from '../db';
import type { Command } from '../types';
import { getWeekNumber } from '../utils';

const stats: Command = {
  name: 'stats',
  description: 'Stats',
  args: false,
  permissions: 'ADMINISTRATOR',
  async execute(msg) {
    const db = await initDb();

    const { totalStats, statsChangeThisWeek } = await getStatsChangeThisWeek(db);

    return msg.channel.send(
      [
        format('Najbardziej aktywne w tym tygodniu:', statsChangeThisWeek),
        '\n',
        format('Najbardziej aktywne osoby od początku istnienia serwera:', totalStats),
      ].join('\n'),
    );
  },
};

export default stats;

type Stats = {
  readonly memberId: string;
  readonly messagesCount: number;
};

function format(title: string, stats: readonly Stats[]) {
  const messages = [
    `**${title}**`,
    ...stats
      .slice(0, 10)
      .map(
        ({ messagesCount, memberId }, index) =>
          `\`${(index + 1).toString().padStart(2, ' ')}\`. <@${memberId}> – ${messagesCount ?? 0}`,
      ),
  ];
  return messages.join('\n');
}

async function getStatsChangeThisWeek(db: Db) {
  const statsCollection = getStatsCollection(db);

  const now = new Date();
  const [year1, week1] = getWeekNumber(now);
  const thisweek = `${year1}-${week1}`;

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

    statsCollection.find({ yearWeek: thisweek }).toArray(),

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

  return { statsChangeThisWeek, totalStats: totalStats as readonly Stats[] };
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
