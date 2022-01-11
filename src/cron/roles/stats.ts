import Discord from 'discord.js';
import { fetchOrCreateRole, updateRoles } from '.';
import { initDb, getStatsCollection } from '../../db';
import { offsetDateByWeeks } from '../../utils';

const TOP_STATS_ROLE_NAME = '🏎 AKTYWNI';

const createStatsRole = (guild: Discord.Guild) => {
  return guild.roles.create({
    data: {
      name: TOP_STATS_ROLE_NAME,
      color: 'DARK_VIVID_PINK',
      mentionable: false,
      hoist: true,
    },
    reason: 'Najbardziej aktywna/y',
  });
};

interface MemberTotalStats {
  readonly _id: string;
  readonly messagesCount: number;
  readonly memberName: string;
}

const getBestStatsMemberIds = async (
  fromDate = offsetDateByWeeks(new Date(), 2),
  toDate = new Date(),
) => {
  const db = await initDb();
  const statsCollection = getStatsCollection(db);

  const agg = statsCollection
    .aggregate<MemberTotalStats>([
      { $match: { updatedAt: { $gte: fromDate, $lte: toDate } } },
      {
        $group: {
          _id: '$memberId',
          messagesCount: { $sum: '$messagesCount' },
          memberName: { $push: '$memberName' },
        },
      },
      { $sort: { messagesCount: -1 } },
      { $limit: 10 },
      { $match: { messagesCount: { $gt: 0 } } },
      { $addFields: { memberName: { $arrayElemAt: [{ $reverseArray: '$memberName' }, 0] } } },
    ])
    .toArray();

  return agg;
};

const getTopStatsMembers = async (guild: Discord.Guild) => {
  const ids = await getBestStatsMemberIds();

  return Promise.all(ids.map(({ _id }) => guild.members.fetch(_id)));
};

export const updateStatsRoles = async (guild: Discord.Guild) => {
  const [statsRole, bestStatsMembers] = await Promise.all([
    fetchOrCreateRole(guild, TOP_STATS_ROLE_NAME, createStatsRole),
    getTopStatsMembers(guild),
  ]);

  await updateRoles(statsRole, bestStatsMembers);
};
