import type { Command } from '../types';

const xd: Command = {
  name: 'xd',
  description: 'XD',
  args: 'prohibited',
  cooldown: 60,
  execute(msg) {
    return msg.channel.send({
      files: [
        {
          attachment: 'https://i.imgur.com/vbyc7yL.gif',
        },
      ],
    });
  },
};

export default xd;
