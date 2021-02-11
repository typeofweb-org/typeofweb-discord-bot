import { Command } from '../types';

const cze: Command = {
  name: 'cze',
  description: 'cze',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('<:cze:775431912503640074>');
  },
};

export default cze;
