import Discord from 'discord.js';
import { Command } from '../types';

const spectre: Command = {
  name: 'spectre',
  description: 'Wyświetla link do marszu radeckiego',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`Witamy Spectre! https://www.youtube.com/watch?v=TOWdT6Drvwk`);
  },
};

export default spectre;
