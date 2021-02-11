import { Command } from '../types';

const dzk: Command = {
  name: 'dzk',
  description: 'dzk',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('<:dzk:805434449298325505>');
  },
};

export default dzk;
