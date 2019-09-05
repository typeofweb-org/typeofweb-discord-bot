import Discord from 'discord.js';
import { Command } from '../types';

const mydevil: Command = {
  name: 'mydevil',
  description: 'Wyświetla link do MyDevil.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`http://www.mydevil.net/pp/9UVOSJRZIV`);
  },
};

export default mydevil;
