import { Command } from '../types';

const rozwuj: Command = {
  name: 'rozwuj',
  description: 'rozwuj',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('<:welcoded:808389167682945115> <https://rozwuj.pl>');
  },
};

export default rozwuj;
