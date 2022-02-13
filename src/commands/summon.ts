import { Command } from '../types';

const summon: Command = {
  name: 'summon',
  description: '_Wake up, Michał, someone is wrong on the Internet…_',
  args: 'prohibited',
  cooldown: 60,
  execute(msg) {
    return msg.channel.send({
      files: [
        {
          attachment: 'https://i.imgur.com/Sl42AMi.png',
        },
      ],
    });
  },
};

export default summon;
