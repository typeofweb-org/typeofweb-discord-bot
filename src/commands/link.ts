import type Discord from 'discord.js';

import type { Command } from '../types';

const link: Command = {
  name: 'link',
  description: 'Wyświetla link do zapraszania.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(`Link do zapraszania: https://discord.typeofweb.com/`);
  },
};

export default link;
