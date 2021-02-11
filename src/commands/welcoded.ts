import { Command } from '../types';

const welcoded: Command = {
  name: 'welcoded',
  description: 'Welcoded',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('<:welcoded:808389167682945115> <https://welcoded.com>');
  },
};

export default welcoded;
