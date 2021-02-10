import { Command } from '../types';

const rozwuj: Command = {
  name: 'rozwuj',
  description: 'rozwuj',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send(':welcoded: <https://rozwuj.pl>');
  },
};

export default rozwuj;
