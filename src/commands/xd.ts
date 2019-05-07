import { Command } from '../types';

const link: Command = {
  name: 'xd',
  description: 'XD',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.sendFile('https://i.imgur.com/vbyc7yL.gif');
  },
};

export default link;
