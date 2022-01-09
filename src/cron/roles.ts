import Discord from 'discord.js';

import { getConfig } from '../config';
import { initDb, getKarmaCollection } from '../db';
import { offsetDateByWeeks } from '../utils';

interface MemberTotalKarma {
  readonly _id: string;
  readonly total: number;
}

const TYPE_OF_WEB_GUILD_ID = '440163731704643589';
const ROLE_NAME = 'AKTYWNI';

const createKarmaRole = (guild: Discord.Guild) => {
  return guild.roles.create({
    data: {
      name: ROLE_NAME,
      color: 'DARK_VIVID_PINK',
      mentionable: false,
      hoist: true,
    },
    reason: 'Most active',
  });
};

const fetchKarmaRole = async (guild: Discord.Guild) => {
  const roles = await guild.roles.fetch(undefined, false);
  return roles.cache.find((role) => role.name === ROLE_NAME);
};

const fetchOrCreateKarmaRole = async (guild: Discord.Guild) => {
  const role = await fetchKarmaRole(guild);
  if (!role) {
    return createKarmaRole(guild);
  }
  return role;
};

const giveRole = async (member: Discord.GuildMember, role: Discord.Role) => {
  console.debug(`Adding role ${role.name} to member ${member.displayName}!`);
  return member.roles.add(role);
};

const removeRole = (member: Discord.GuildMember, role: Discord.Role) => {
  console.debug(`Removing role ${role.name} from member ${member.displayName}!`);
  return member.roles.remove(role.id);
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

const getBestMembers = async (guild: Discord.Guild) => {
  const ids = await getBestKarmaMemberIds();

  return Promise.all(ids.map(({ _id }) => guild.members.fetch(_id)));
};

const assignMembersRoles = async (members: Discord.GuildMember[], role: Discord.Role) => {
  return Promise.all(members.map((member) => giveRole(member, role)));
};

const removeMembersRoles = (
  members: Discord.Collection<string, Discord.GuildMember>,
  role: Discord.Role,
) => {
  return Promise.all(members.map((member) => removeRole(member, role)));
};

export const updateKarmaRoles = async () => {
  const client = new Discord.Client();
  await client.login(getConfig('DISCORD_BOT_TOKEN'));

  const guild = await client.guilds.fetch(TYPE_OF_WEB_GUILD_ID);
  const [karmaRole, bestKarmaMembers] = await Promise.all([
    fetchOrCreateKarmaRole(guild),
    getBestMembers(guild),
  ]);

  const currentKarmaMembers = karmaRole.members;

  const membersToRemove = currentKarmaMembers.filter(
    (m) => !bestKarmaMembers.find((bm) => bm.id === m.id),
  );
  const membersToAdd = bestKarmaMembers.filter(
    (bm) => !currentKarmaMembers.find((m) => m.id === bm.id),
  );

  await removeMembersRoles(membersToRemove, karmaRole);
  await assignMembersRoles(membersToAdd, karmaRole);
};
