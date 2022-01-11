import Discord from 'discord.js';
import { polishPlurals } from 'polish-plurals';

import {
  getEmojiForKarmaValue,
  getKarmaForMember,
  getKarmaForMembers,
  KarmaAgg,
} from '../data/karma';
import { getKarmaCollection, initDb } from '../db';
import type { Command } from '../types';

export const KARMA_REGEX = new RegExp(
  `^${Discord.MessageMentions.USERS_PATTERN.source}\\s*\\+\\+\\s*(?<description>.*)$`,
);

const addKarma: Command = {
  name: '++',
  description: 'Podziękuj użytkownikom wpisując `@nazwa ++`',
  args: false,
  cooldown: 10,
  async execute(msg) {
    const member = await msg.mentions.members?.first()?.fetch();
    if (!member) {
      return null;
    }

    const from = msg.author.id;
    const to = member.id;

    if (from === to) {
      return null;
    }

    const db = await initDb();
    const karmaCollection = getKarmaCollection(db);

    await karmaCollection.insertOne({
      from,
      to,
      createdAt: new Date(),
      value: 1,
    });

    const agg = await getKarmaForMember(to, db);
    const value = agg?.value ?? 0;

    return msg.channel.send(
      `${msg.author.toString()} podziękował(a) ${member.toString()}! Karma ${member.toString()} wynosi ${value.toFixed(
        2,
      )} ${getEmojiForKarmaValue(value)}`,
    );
  },
};

const karma: Command = {
  name: 'karma',
  description: 'Sprawdź ile kto ma pkt. karmy.',
  args: false,
  async execute(msg) {
    const member = await msg.mentions.members?.first()?.fetch();

    const db = await initDb();

    if (member) {
      const agg = await getKarmaForMember(member.id, db);
      const value = agg?.value ?? 0;

      const pkt = polishPlurals('punkt', 'punkty', 'punktów', value);

      return msg.channel.send(
        `${member.displayName} ma ${value.toFixed(2)} ${pkt} karmy ${getEmojiForKarmaValue(value)}`,
      );
    } else {
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
    }
  },
};

export { addKarma, karma };
