import type { Command } from '../types';

const m1: Command = {
  name: 'm1',
  description: 'Apple silicon m1',
  args: 'prohibited',
  cooldown: 10,
  execute(msg) {
    return msg.channel.send(
      [
        `👨‍💻 ***Czy Apple Silicon m1 jest gotowe dla developerów?*** 👩‍💻 \n`,
        `https://isapplesiliconready.com/for/developer`,
        `https://www.apple.com/mac/m1/`,
      ].join('\n'),
    );
  },
};

export default m1;
