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
import prune from './prune';
import regulamin from './regulamin';
import server from './server';
import spotify from './spotify';
import xd from './xd';
import youtube from './youtube';

const commandPattern = new RegExp(getConfig('PREFIX') + '([a-z]+)(?: (.*))?');

const allCommands = {
  co,
  execute,
  link,
  markdown,
  mdn,
  mongodb,
  mydevil,
  npm,
  prune,
  regulamin,
  server,
  spotify,
  xd,
  youtube,
};

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

  if (timestamps.has(msg.author.id)) {
    const expirationTime = timestamps.get(msg.author.id)! + cooldownAmount;

    if (now < expirationTime) {
      const member = await msg.guild.fetchMember(msg.author);
      if (member.hasPermission(PERMISSION_TO_OVERRIDE_COOLDOWN)) {
        return;
      }

      // tslint:disable-next-line:no-magic-numbers
      const timeLeft = Math.ceil((expirationTime - now) / 1000);
      throw new InvalidUsageError(
        `musisz poczekać jeszcze ${timeLeft}s, żeby znowu użyć \`${command.name}\`!.`
      );
    }
  } else {
    timestamps.set(id, now);
    setTimeout(() => timestamps.delete(id), cooldownAmount);
  }
}

function printHelp(msg: Discord.Message, member: Discord.GuildMember) {
  const commands = Object.entries(allCommands)
    .sort(([a], [b]) => {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 1;
    })
    .filter(([, command]) => {
      if (command.permissions && !member.hasPermission(command.permissions)) {
        return false;
      }
      return true;
    });

  const data = [
    `**Oto lista wszystkich komend:**`,
    ...commands.map(([name, command]) => {
      return `**\`${getConfig('PREFIX')}${name}\`** — ${command.description}`;
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
    .catch(error => {
      console.error(`Could not send help DM to ${msg.author.tag}.\n`, error);
      return msg.reply(
        'Niestety nie mogłam Ci wysłać wiadomości prywatnej 😢 Może masz wyłączone DM?'
      );
    });
}

export async function handleCommand(msg: Discord.Message) {
  const [, maybeCommand, rest] = msg.content.match(commandPattern) || [null, null, null];

  const member = await msg.guild.fetchMember(msg.author);
  if (maybeCommand === 'help') {
    return printHelp(msg, member);
  }

  if (!maybeCommand || !(maybeCommand in allCommands)) {
    return undefined;
  }

  const commandName = maybeCommand as keyof typeof allCommands;

  const command = allCommands[commandName];

  if (command.permissions && !member.hasPermission(command.permissions)) {
    return undefined; // silence is golden
  }

  msg.channel.startTyping();

  if (command.guildOnly && msg.channel.type !== 'text') {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  await verifyCooldown(msg, command);

  if (!command.args) {
    return command.execute(msg);
  }

  const args = rest ? rest.split(/\s+/g) : [];
  if (!args.length) {
    throw new InvalidUsageError(`nie podano argumentów!`);
  }

  return command.execute(msg, args);
}
