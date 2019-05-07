import Discord from 'discord.js';
import { getConfig } from '../config';
import server from './server';
import link from './link';
import { InvalidUsageError } from '../types';

const commandPattern = new RegExp(getConfig('PREFIX') + '([a-z]+)(?: (.*))?');

const allCommands = { server, link };

export async function handleCommand(msg: Discord.Message) {
  const [, maybeCommand, rest] = msg.content.match(commandPattern) || [null, null, null];

  if (!maybeCommand || !(maybeCommand in allCommands)) {
    return undefined;
  }

  const commandName = maybeCommand as keyof typeof allCommands;

  const command = allCommands[commandName];

  if (command.guildOnly && msg.channel.type !== 'text') {
    throw new InvalidUsageError(`to polecenie można wywołać tylko na kanałach.`);
  }

  if (!command.args) {
    return command.execute(msg);
  }

  const args = rest ? rest.split(/\s+/g) : [];
  if (!args.length) {
    throw new InvalidUsageError(`nie podałeś argumentów!`);
  }

  return command.execute(msg, args);
}
