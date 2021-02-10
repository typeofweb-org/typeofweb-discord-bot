import { Command } from '../types';

const odbierz: Command = {
  name: 'odbierz',
  description: 'odbierz',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('https://www.youtube.com/watch?v=4qae2BKuDEQ');
  },
};

export default odbierz;
