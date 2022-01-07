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

type Guild = Discord.Guild | undefined;

type Role = Discord.Role | undefined;

const createKarmaRole = async (guild: Guild) => {
  await guild?.roles.create({
    data: {
      name: ROLE_NAME,
      color: 'DARK_VIVID_PINK',
    },
  });
};

const fetchKarmaRole = async (guild: Guild) => {
  return guild && (await guild?.roles.fetch()).cache.find((role) => role.name === ROLE_NAME);
};

const getKarmaRole = async (guild: Guild) => {
  const role = await fetchKarmaRole(guild);

  if (!role) await createKarmaRole(guild);
  else return role;
  return await fetchKarmaRole(guild);
};

const giveRole = async (guild: Guild, role: Role, memberId: string) => {
  try {
    const member = await guild?.members.fetch(memberId);
    if (!member) console.error(`Member with id ${memberId} doesn't exists!`);
    if (!role) console.error(`Role for karma doesn't exists`);
    else await member?.roles.add(role);
  } catch (err) {
    console.error(`Could not assign member with id ${memberId} a role ${ROLE_NAME};`, err);
  }
};

const removeRole = async (member: Discord.GuildMember, role: Role) => {
  if (!role) return console.error(`Role for karma doesn't exists`);

  try {
    await member.roles.remove(role.id);
  } catch (err) {
    console.error(`Could not remove member with id ${member.id} a role ${ROLE_NAME}`, err);
  }
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

const assignMembersRoles = async (guild: Guild, role: Role) => {
  const startDate = offsetDateByWeeks(new Date(), 2);
  const bestKarmaMembers = await getBestMembers(startDate);

  await Promise.all(bestKarmaMembers.map(({ _id }) => giveRole(guild, role, _id)));
};

const removeMembersRoles = async (role: Role) => {
  const membersWithRole = role?.members;

  if (membersWithRole) await Promise.all(membersWithRole.map((member) => removeRole(member, role)));
};

const reassignRoles = async () => {
  const client = new Discord.Client();
  await client.login(getConfig('DISCORD_BOT_TOKEN'));
  const guild = client.guilds.cache.get(TYPE_OF_WEB_GUILD_ID);

  const karmaRole = await getKarmaRole(guild);

  await removeMembersRoles(karmaRole);
  await assignMembersRoles(guild, karmaRole);
};

void reassignRoles();
