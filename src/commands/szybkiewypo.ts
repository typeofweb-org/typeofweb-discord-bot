import { Command } from '../types';

const szybkiewypo: Command = {
  name: 'szybkiewypo',
  description: 'Szybkie wypo',
  args: false,
  cooldown: 60,
  execute(msg) {
    return msg.channel.send('Szybkie wypo tbc...');
  },
};

export default szybkiewypo;
