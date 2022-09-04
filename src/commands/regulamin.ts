import type Discord from 'discord.js';

import type { Command } from '../types';

const regulamin: Command = {
  name: 'regulamin',
  description: 'Wyświetla regulamin.',
  args: 'prohibited',
  execute(msg: Discord.Message) {
    return msg.channel.send(`Regulamin: https://typeofweb.com/polski-frontend-discord/`);
  },
};

export default regulamin;
