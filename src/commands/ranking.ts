import type { KarmaAgg } from '../data/karma';
import { getEmojiForKarmaValue, getKarmaForMembers } from '../data/karma';
import { initDb } from '../db';
import type { Command } from '../types';

const ranking: Command = {
  name: 'ranking',
  description: 'Ranking karmy',
  args: false,
  async execute(msg) {
    const db = await initDb();
    const agg = await getKarmaForMembers(db);

    const data = agg.filter((el): el is KarmaAgg => !!el);

    await Promise.allSettled(data.map(({ _id: memberId }) => msg.guild?.members.fetch(memberId)));

    const messages = [
      `**TOP 10 karma**`,
      ...data.map(({ _id: memberId, value }, index) => {
        return `\`${(index + 1).toString().padStart(2, ' ')}\`. ${
          msg.guild?.members.cache.get(memberId)?.displayName ?? ''
        } – ${value.toFixed(2)} ${getEmojiForKarmaValue(value)}`;
      }),
    ];

    return msg.channel.send(messages.join('\n'));
  },
};
export default ranking;
