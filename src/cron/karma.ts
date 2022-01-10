import Discord from 'discord.js';
import { initDb, getKarmaCollection } from '../db';
import { offsetDateByWeeks } from '../utils';
import { fetchOrCreateRole, updateRoles } from './roles';

const TOP_KARMA_ROLE_NAME = 'POMOCNI';

interface MemberTotalKarma {
  readonly _id: string;
  readonly total: number;
}

const createKarmaRole = (guild: Discord.Guild) => {
  return guild.roles.create({
    data: {
      name: TOP_KARMA_ROLE_NAME,
      color: 'DARK_VIVID_PINK',
      mentionable: false,
      hoist: true,
    },
    reason: 'Najbardziej pomocny/a',
  });
};

const getBestKarmaMemberIds = async (
  fromDate = offsetDateByWeeks(new Date(), 2),
  toDate = new Date(),
) => {
  const db = await initDb();
  const karmaCollection = getKarmaCollection(db);

  const agg = await karmaCollection
    .aggregate<MemberTotalKarma>([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$to', total: { $sum: '$value' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return agg;
};

const getTopKarmaMembers = async (guild: Discord.Guild) => {
  const ids = await getBestKarmaMemberIds();

  return Promise.all(ids.map(({ _id }) => guild.members.fetch(_id)));
};

export const updateKarmaRoles = async (guild: Discord.Guild) => {
  const [karmaRole, bestKarmaMembers] = await Promise.all([
    fetchOrCreateRole(guild, TOP_KARMA_ROLE_NAME, createKarmaRole),
    getTopKarmaMembers(guild),
  ]);

  await updateRoles(karmaRole, bestKarmaMembers);
};
