import { Command } from '../types';

const boli: Command = {
  name: 'boli',
  description: 'boli mnie to',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('https://www.youtube.com/watch?v=Mq7769OaWqY');
  },
};

export default boli;
