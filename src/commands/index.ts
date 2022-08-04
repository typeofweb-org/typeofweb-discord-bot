import Discord from 'discord.js';
import type { PermissionString } from 'discord.js';

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
const PERMISSION_TO_OVERRIDE_COOLDOWN: PermissionString = 'ADMINISTRATOR';

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
      const member = msg.guild.member(msg.author);
      if (member?.hasPermission(PERMISSION_TO_OVERRIDE_COOLDOWN)) {
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
      if (command.permissions && !member.hasPermission(command.permissions)) {
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
    .send(data, { split: true })
    .then(() => {
      if (msg.channel.type === 'dm') {
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

export function handleCommand(msg: Discord.Message) {
  if (!msg.guild) {
    return undefined;
  }

  if (KARMA_REGEX.test(msg.content)) {
    return processCommand(msg, addKarma, null);
  }

  const [, maybeCommand, rest] = COMMAND_PATTERN.exec(msg.content) || [null, null, null];

  if (maybeCommand === 'help') {
    const member = msg.guild.member(msg.author);
    if (member) {
      return printHelp(msg, member);
    }
  }

  const command = allCommands.find((c) => maybeCommand === c.name);

  if (!command || !maybeCommand) {
    return undefined;
  }

  return processCommand(msg, command, rest);
}

function processCommand(msg: Discord.Message, command: Command, rest: string | null) {
  const member = msg.guild?.member(msg.author);

  if (!member || (command.permissions && !member.hasPermission(command.permissions))) {
    return undefined; // silence is golden
  }

  void msg.channel.startTyping();

  if (command.guildOnly && msg.channel.type !== 'text') {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  verifyCooldown(msg, command);
  const args = rest ? rest.split(/\s+/g) : [];

  if (command.args === 'optional') {
    return command.execute(msg, args);
  }
  if (!args.length && command.args === 'required') {
    throw new InvalidUsageError(`nie podano argumentów!`);
  }
  if (args.length && command.args === 'prohibited') {
    throw new InvalidUsageError(`argumenty niedozwolone!`);
  }

  return command.execute(msg, args);
}
