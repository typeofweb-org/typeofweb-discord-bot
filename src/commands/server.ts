import type Discord from 'discord.js';

import type { Command } from '../types';

const server: Command = {
  name: 'server',
  description: 'Zwraca nazwę serwera.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`Nazwa tego serwera to: ${String(msg.guild?.name)}`);
  },
};

export default server;
