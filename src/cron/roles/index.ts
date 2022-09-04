import type Discord from 'discord.js';

const fetchRole = async (guild: Discord.Guild, roleName: string) => {
  const roles = await guild.roles.fetch(undefined, { cache: false });
  return roles.find((role) => role.name === roleName);
};

export const fetchOrCreateRole = async (
  guild: Discord.Guild,
  roleName: string,
  createRole: (guild: Discord.Guild) => Promise<Discord.Role>,
) => {
  const role = await fetchRole(guild, roleName);
  if (!role) {
    return createRole(guild);
  }
  return role;
};

const giveRole = (member: Discord.GuildMember, role: Discord.Role) => {
  console.debug(`Adding role ${role.name} to member ${member.displayName}!`);
  return member.roles.add(role);
};

const removeRole = (member: Discord.GuildMember, role: Discord.Role) => {
  console.debug(`Removing role ${role.name} from member ${member.displayName}!`);
  return member.roles.remove(role.id);
};

const assignMembersRoles = (members: readonly Discord.GuildMember[], role: Discord.Role) => {
  return Promise.all(members.map((member) => giveRole(member, role)));
};

const removeMembersRoles = (
  members: Discord.Collection<string, Discord.GuildMember>,
  role: Discord.Role,
) => {
  return Promise.all(members.map((member) => removeRole(member, role)));
};

export const updateRoles = async (
  role: Discord.Role,
  futureRoleMembers: readonly Discord.GuildMember[],
) => {
  const currentRoleMembers = role.members;

  const membersToRemove = currentRoleMembers.filter(
    (m) => !futureRoleMembers.find((bm) => bm.id === m.id),
  );
  const membersToAdd = futureRoleMembers.filter(
    (bm) => !currentRoleMembers.find((m) => m.id === bm.id),
  );

  await removeMembersRoles(membersToRemove, role);
  await assignMembersRoles(membersToAdd, role);
};
