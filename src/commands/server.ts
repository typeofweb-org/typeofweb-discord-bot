import Discord from 'discord.js';
import { Command } from '../types';

const server: Command = {
  name: 'server',
  description: 'Zwraca nazwę serwera.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`Nazwa tego serwera to: ${msg.guild.name}`);
  },
};

export default server;
