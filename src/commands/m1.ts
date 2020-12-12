import { Command } from '../types';

const nameA = 'm1';

const m1: Command = {
  name: `${nameA}`,
  description: 'Apple silicon m1',
  args: false,
  cooldown: 10,
  execute(msg) {
    return msg.channel.send([
      `👨‍💻 ***Czy Apple Silicon m1 jest gotowe dla developerów?*** 👩‍💻 \n`,
      `https://isapplesiliconready.com/for/developer`,
      `https://www.apple.com/mac/m1/`,
    ]);
  },
};

export default m1;
