import Discord, { PermissionString } from 'discord.js';
import { getConfig } from '../config';
import { InvalidUsageError, Command } from '../types';

import co from './co';
import execute from './execute';
import link from './link';
import markdown from './markdown';
import mdn from './mdn';
import mongodb from './mongodb';
import mydevil from './mydevil';
import npm from './npm';
import odpowiedz from './odpowiedz';
import prune from './prune';
import quiz from './quiz';
import regulamin from './regulamin';
import roll from './roll';
import server from './server';
import spotify from './spotify';
import xd from './xd';
import youtube from './youtube';
import typeofweb from './towarticle';
import wiki from './wiki';
import m1 from './m1';
import skierowanie from './skierowanie';
import yesno from './yesno';

const COMMAND_PATTERN = new RegExp(getConfig('PREFIX') + '([a-z1-9]+)(?: (.*))?');

const allCommands = [
  co,
  execute,
  link,
  m1,
  markdown,
  mdn,
  mongodb,
  mydevil,
  npm,
  odpowiedz,
  prune,
  quiz,
  regulamin,
  roll,
  server,
  spotify,
  xd,
  youtube,
  typeofweb,
  wiki,
  skierowanie,
  yesno,
];

const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();
const PERMISSION_TO_OVERRIDE_COOLDOWN: PermissionString = 'ADMINISTRATOR';

async function verifyCooldown(msg: Discord.Message, command: Command) {
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
      const member = await msg.guild.fetchMember(msg.author);
      if (member.hasPermission(PERMISSION_TO_OVERRIDE_COOLDOWN)) {
        return;
      }

      // tslint:disable-next-line:no-magic-numbers
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
    .then(async () => {
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

export async function handleCommand(msg: Discord.Message) {
  if (!msg.guild) {
    return undefined;
  }
  const [, maybeCommand, rest] = msg.content.match(COMMAND_PATTERN) || [null, null, null];

  if (maybeCommand === 'help') {
    const member = await msg.guild.fetchMember(msg.author);
    return printHelp(msg, member);
  }

  const command = allCommands.find((c) => maybeCommand === c.name);

  if (!command || !maybeCommand) {
    return undefined;
  }

  const member = await msg.guild.fetchMember(msg.author);

  if (command.permissions && !member.hasPermission(command.permissions)) {
    return undefined; // silence is golden
  }

  msg.channel.startTyping();

  if (command.guildOnly && msg.channel.type !== 'text') {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  await verifyCooldown(msg, command);

  if (command.args === false) {
    return command.execute(msg);
  }

  const args = rest ? rest.split(/\s+/g) : [];
  if (!args.length && command.args === true) {
    throw new InvalidUsageError(`nie podano argumentów!`);
  }

  return command.execute(msg, args);
}
