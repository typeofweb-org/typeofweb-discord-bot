import Discord from 'discord.js';

import { getConfig } from '../config';
import { initDb, getKarmaCollection } from '../db';
import { offsetDateByWeeks } from '../utils';

interface MemberTotalKarma {
  readonly _id: string;
  readonly total: number;
}

const TYPE_OF_WEB_GUILD_ID = '440163731704643589';

const ROLE_NAME = 'top';

const createKarmaRole = (guild: Discord.Guild) => {
  return guild.roles.create({
    data: {
      name: ROLE_NAME,
      color: 'DARK_VIVID_PINK',
    },
  });
};

const fetchKarmaRole = async (guild: Discord.Guild) => {
  return (await guild.roles.fetch()).cache.find((role) => role.name === ROLE_NAME);
};

const getKarmaRole = async (guild: Discord.Guild) => {
  const role = await fetchKarmaRole(guild);

  if (role) return role;
  else return createKarmaRole(guild);
};

const giveRole = async (guild: Discord.Guild, role: Discord.Role, memberId: string) => {
  const member = await guild.members.fetch(memberId);
  if (!member) {
    return console.error(`Member with id ${memberId} doesn't exists!`);
  }

  return member.roles.add(role);
};

const removeRole = (member: Discord.GuildMember, role: Discord.Role) => {
  return member.roles.remove(role.id);
};

const getBestMembers = async (fromDate: Date, toDate?: Date) => {
  const db = await initDb();
  const karmaCollection = getKarmaCollection(db);

  const agg = karmaCollection
    .aggregate<MemberTotalKarma>([
      { $match: { createdAt: { $gte: fromDate, $lte: toDate ?? new Date() } } },
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

  return Promise.all(bestKarmaMembers.map(({ _id }) => giveRole(guild, role, _id)));
};

const removeMembersRoles = (role: Discord.Role) => {
  const membersWithRole = role.members;

  if (membersWithRole) {
    return Promise.all(membersWithRole.map((member) => removeRole(member, role)));
  } else {
    return console.error(`Members with role doesn't exists!`);
  }
};

const reassignRoles = async () => {
  const client = new Discord.Client();
  await client.login(getConfig('DISCORD_BOT_TOKEN'));
  const guild = client.guilds.cache.get(TYPE_OF_WEB_GUILD_ID);

  if (!guild) return console.error(`Guild with id ${TYPE_OF_WEB_GUILD_ID} doesn't exists!`);

  const karmaRole = await getKarmaRole(guild);

  if (!karmaRole) return console.error(`Karma role doesn't exists!`);

  try {
    await removeMembersRoles(karmaRole);
    await assignMembersRoles(guild, karmaRole);
  } catch (err) {
    console.error('Could not reassign roles for best members', err);
  }
};

void reassignRoles();
