import { Command } from '../types';

const formatter = new Intl.ListFormat('pl', { style: 'long', type: 'conjunction' });

const prs: Command = {
  name: 'prs',
  description: 'PRs are welcome',
  args: 'required',
  async execute(msg) {
    if (!msg.mentions.members?.size) {
      return null;
    }

    const mentions = formatter.format(msg.mentions.members.map((m) => m.toString()));

    await msg.delete();
    await msg.channel.send(`PRs are welcome ${mentions}`);
    return null;
  },
};

export default prs;
