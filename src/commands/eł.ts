import { getEłMode, triggerEłMode } from '../eł-mode';
import { Command } from '../types';

const eł: Command = {
  name: 'eł',
  description: 'włącza tłyb eł',
  args: false,
  cooldown: 60,
  execute(msg) {
    triggerEłMode();
    !getEłMode() && msg.delete();
    return msg.channel.send(!getEłMode() ? '***wyłączam tłyb eł***' : '***włączam tłyb eł***');
  },
};

export default eł;
