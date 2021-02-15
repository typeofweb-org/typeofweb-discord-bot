import { Command } from '../types';

const dlaczegoTede: Command = {
  name: 'tede',
  description: 'dlaczego tede',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('https://www.youtube.com/watch?v=NGX-QxR8dbc');
  },
};

export default dlaczegoTede;
