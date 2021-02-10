import { Command } from '../types';

const kalwi: Command = {
  name: 'kalwi',
  description: 'kalwi dzwoni',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send(':kalwi:');
  },
};

export default kalwi;
