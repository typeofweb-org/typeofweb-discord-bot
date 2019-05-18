import Discord from 'discord.js';
import { getConfig } from '../config';
import server from './server';
import link from './link';
import mdn from './mdn';
import xd from './xd';
import youtube from './youtube';
import spotify from './spotify';
import regulamin from './regulamin';
import markdown from './markdown';
import { InvalidUsageError, Command } from '../types';

const commandPattern = new RegExp(getConfig('PREFIX') + '([a-z]+)(?: (.*))?');

const allCommands = { server, link, mdn, xd, youtube, spotify, regulamin, markdown };
const cooldowns = new Discord.Collection<string, Discord.Collection<string, number>>();

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

  if (timestamps.has(msg.author.id)) {
    const expirationTime = timestamps.get(msg.author.id)! + cooldownAmount;

    if (now < expirationTime) {
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

function printHelp(msg: Discord.Message) {
  const commands = Object.entries(allCommands).sort(([a], [b]) => {
    if (a > b) {
      return 1;
    } else if (a < b) {
      return -1;
    }
    return 1;
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

  if (maybeCommand === 'help') {
    return printHelp(msg);
  }

  if (!maybeCommand || !(maybeCommand in allCommands)) {
    return undefined;
  }

  msg.channel.startTyping();

  const commandName = maybeCommand as keyof typeof allCommands;

  const command = allCommands[commandName];

  await verifyCooldown(msg, command);

  if (command.guildOnly && msg.channel.type !== 'text') {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  if (!command.args) {
    return command.execute(msg);
  }

  const args = rest ? rest.split(/\s+/g) : [];
  if (!args.length) {
    throw new InvalidUsageError(`nie podano argumentów!`);
  }

  return command.execute(msg, args);
}
