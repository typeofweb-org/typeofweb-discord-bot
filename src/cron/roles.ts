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

const giveRole = async (guild: Discord.Guild, role: Discord.Role, memberId: string) => {
  const member = await guild.members.fetch(memberId);
  if (!member) {
    console.error(`Member with id ${memberId} doesn't exists!`);
    return;
  }

  console.debug(`Adding role ${role.name} to member ${member.displayName}!`);
  return member.roles.add(role);
};

const removeRole = (member: Discord.GuildMember, role: Discord.Role) => {
  console.debug(`Removing role ${role.name} from member ${member.displayName}!`);
  return member.roles.remove(role.id);
};

const getBestMembers = async (fromDate: Date, toDate = new Date()) => {
  const db = await initDb();
  const karmaCollection = getKarmaCollection(db);

  const agg = karmaCollection
    .aggregate<MemberTotalKarma>([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
      { $group: { _id: '$to', total: { $sum: '$value' } } },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ])
    .toArray();

  return agg;
};

const assignMembersRoles = async (guild: Discord.Guild, role: Discord.Role) => {
  const startDate = offsetDateByWeeks(new Date(), 2);
  const bestKarmaMembers = await getBestMembers(startDate);

  console.log(bestKarmaMembers);

  return Promise.all(bestKarmaMembers.map(({ _id }) => giveRole(guild, role, _id)));
};

const removeMembersRoles = (role: Discord.Role) => {
  if (role.members.size > 0) {
    return Promise.all(role.members.map((member) => removeRole(member, role)));
  }

  console.error(`Members with role don't exists!`);
  return;
};

export const updateKarmaRoles = async () => {
  const client = new Discord.Client();
  await client.login(getConfig('DISCORD_BOT_TOKEN'));

  const guild = await client.guilds.fetch(TYPE_OF_WEB_GUILD_ID);
  const karmaRole = await fetchOrCreateKarmaRole(guild);

  await removeMembersRoles(karmaRole);
  await assignMembersRoles(guild, karmaRole);
};
