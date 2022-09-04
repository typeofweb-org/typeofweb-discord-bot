import Discord, { SlashCommandBuilder } from 'discord.js';
import type { PermissionsString } from 'discord.js';

import { getConfig } from '../config';
import type { Command } from '../types';
import { InvalidUsageError } from '../types';

import co from './co';
import execute from './execute';
import { addKarma, karma, KARMA_REGEX } from './karma';
// import { grzesiu, morritz } from './kocopoly';
import link from './link';
import m1 from './m1';
import markdown from './markdown';
import mdn from './mdn';
import mongodb from './mongodb';
import mydevil from './mydevil';
import npm from './npm';
import odpowiedz from './odpowiedz';
import prs from './prs';
import prune from './prune';
import quiz from './quiz';
import regulamin from './regulamin';
import roll from './roll';
import server from './server';
import skierowanie from './skierowanie';
import spotify from './spotify';
import stackoverflow from './stackoverflow';
import stats from './stats';
import summon from './summon';
import typeofweb from './towarticle';
import wiki from './wiki';
import xd from './xd';
import xkcd from './xkcd';
import yesno from './yesno';
import youtube from './youtube';

export const COMMAND_PATTERN = new RegExp(getConfig('PREFIX') + '([a-z1-9]+)(?: (.*))?');

const allCommands = [
  co,
  execute,
  // grzesiu,
  karma,
  link,
  m1,
  markdown,
  mdn,
  mongodb,
  // morritz,
  mydevil,
  npm,
  odpowiedz,
  prs,
  prune,
  quiz,
  regulamin,
  roll,
  server,
  skierowanie,
  spotify,
  stats,
  summon,
  typeofweb,
  wiki,
  xd,
  xkcd,
  yesno,
  youtube,
  stackoverflow,
];

const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();
const PERMISSION_TO_OVERRIDE_COOLDOWN: PermissionsString = 'Administrator';

function verifyCooldown(msg: Discord.Message, command: Command) {
  if (typeof command.cooldown !== 'number') {
    return;
  }

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Discord.Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name)!;
  // tslint:disable-next-line:no-magic-numbers
  const cooldownAmount = command.cooldown * 1000;
  const id = msg.author.id;

  if (timestamps.has(msg.author.id) && msg.guild) {
    const expirationTime = timestamps.get(msg.author.id)! + cooldownAmount;

    if (now < expirationTime) {
      const member = msg.guild.members.cache.get(msg.author.id);
      if (member?.permissions.has(PERMISSION_TO_OVERRIDE_COOLDOWN)) {
        return;
      }

      const timeLeft = Math.ceil((expirationTime - now) / 1000);
      throw new InvalidUsageError(
        `musisz poczekać jeszcze ${timeLeft}s, żeby znowu użyć \`${command.name}\`!.`,
      );
    }
  } else {
    timestamps.set(id, now);
    setTimeout(() => timestamps.delete(id), cooldownAmount);
  }
}

function printHelp(msg: Discord.Message, member: Discord.GuildMember) {
  const commands = allCommands
    .sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    .filter((command) => {
      if (command.permissions && !member.permissions.has(command.permissions)) {
        return false;
      }
      return true;
    });

  const data = [
    `**Oto lista wszystkich komend:**`,
    ...commands.map((command) => {
      return `**\`${getConfig('PREFIX')}${command.name}\`** — ${command.description}`;
    }),
  ];

  return msg.author
    .send(data.join('\n'))
    .then(() => {
      if (msg.channel.type === Discord.ChannelType.DM) {
        return undefined;
      }
      return msg.reply('Wysłałam Ci DM ze wszystkimi komendami! 🎉');
    })
    .catch((error) => {
      console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
      return msg.reply(
        'Niestety nie mogłam Ci wysłać wiadomości prywatnej 😢 Może masz wyłączone DM?',
      );
    });
}

export const legacyCommandsToSlashCommands = () => {
  return allCommands
    .filter((legacyCommand) => legacyCommand.name)
    .map((legacyCommand) => {
      const slashCommand = new SlashCommandBuilder()
        .setName(legacyCommand.name)
        .setDescription(legacyCommand.description.slice(0, 100));

      if (legacyCommand.args === 'optional') {
        slashCommand.addStringOption((option) =>
          option.setName('arg').setDescription('arg').setRequired(false),
        );
      }
      if (legacyCommand.args === 'required') {
        slashCommand.addStringOption((option) =>
          option.setName('arg').setDescription('arg').setRequired(true),
        );
      }

      return slashCommand;
    })
    .map((c) => c.toJSON());
};

export const handleSlashCommand = async (
  interaction: Discord.ChatInputCommandInteraction<Discord.CacheType>,
) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  try {
    const content = `${getConfig('PREFIX')}${interaction.commandName} ${
      interaction.options.getString('arg') ?? ''
    }`.trim();
    // @ts-ignore
    interaction.content = content;
    // @ts-ignore
    interaction.author = interaction.user;
    // @ts-ignore
    interaction.channel.send = interaction.reply.bind(interaction);
    // @ts-ignore
    await handleCommand(interaction);
  } catch (err) {
    console.error(err);
  }
};

export function handleCommand(msg: Discord.Message) {
  console.log(1);
  if (!msg.guild) {
    return undefined;
  }

  console.log(2);
  if (KARMA_REGEX.test(msg.content)) {
    return processCommand(msg, addKarma, null);
  }
  console.log(3);

  const [, maybeCommand, rest] = COMMAND_PATTERN.exec(msg.content) || [null, null, null];

  console.log(4, msg.content);
  if (maybeCommand === 'help') {
    const member = msg.guild.members.cache.get(msg.author.id);
    if (member) {
      return printHelp(msg, member);
    }
  }

  console.log(5);
  const command = allCommands.find((c) => maybeCommand === c.name);

  console.log(6, command, maybeCommand);
  if (!command || !maybeCommand) {
    return undefined;
  }

  return processCommand(msg, command, rest);
}

async function processCommand(msg: Discord.Message, command: Command, rest: string | null) {
  console.log(10);
  console.log(msg.guild);
  const member = msg.guild?.members.cache.get(msg.author.id);

  console.log(11);
  if (!member || (command.permissions && !member.permissions.has(command.permissions))) {
    return undefined; // silence is golden
  }

  console.log(12);
  await msg.channel.sendTyping();

  console.log(13);
  if (command.guildOnly && msg.channel.type !== Discord.ChannelType.GuildText) {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  console.log(14);
  verifyCooldown(msg, command);
  const args = rest ? rest.split(/\s+/g) : [];

  console.log(15);
  if (command.args === 'optional') {
    return command.execute(msg, args);
  }
  console.log(16);
  if (!args.length && command.args === 'required') {
    throw new InvalidUsageError(`nie podano argumentów!`);
  }
  console.log(17);
  if (args.length && command.args === 'prohibited') {
    throw new InvalidUsageError(`argumenty niedozwolone!`);
  }

  console.log(18);
  return command.execute(msg, args);
}
