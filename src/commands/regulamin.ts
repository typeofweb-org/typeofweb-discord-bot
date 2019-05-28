import Discord from 'discord.js';
import { Command } from '../types';

const regulamin: Command = {
  name: 'regulamin',
  description: 'Wyświetla regulamin.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`Regulamin: https://typeofweb.com/polski-frontend-discord/`);
  },
};

export default regulamin;
