import Discord from 'discord.js';
import { polishPlurals } from 'polish-plurals';
import Bluebird from 'bluebird';

import {
  getEmojiForKarmaValue,
  getKarmaForMember,
  getKarmaForAllMembers,
  KarmaAgg,
  getKarmaForMembers,
} from '../data/karma';
import { getKarmaCollection, initDb } from '../db';
import type { Command } from '../types';

export const KARMA_REGEX = new RegExp(
  `^(${Discord.MessageMentions.USERS_PATTERN.source}).*\\+\\+\\s*`,
);

const addKarma: Command = {
  name: '++',
  description: 'Podziękuj użytkownikom wpisując `@nazwa ++`',
  args: 'optional',
  cooldown: 5,
  async execute(msg) {
    if (!msg.mentions.members?.size) {
      return null;
    }

    const db = await initDb();
    const karmaCollection = getKarmaCollection(db);

    const from = msg.author.id;

    const membersToReward = await Bluebird.resolve(Array.from(msg.mentions.members.values()))
      .map((m) => m.fetch())
      .filter((m) => m && m.id !== from);

    if (membersToReward.length === 0) {
      return null;
    }

    await karmaCollection.insertMany(
      membersToReward.map((m) => {
        return {
          from,
          to: m.id,
          createdAt: new Date(),
          value: 1,
        };
      }),
    );

    const membersKarma = await getKarmaForMembers(
      db,
      membersToReward.map((m) => m.id),
    );

    const messages = membersKarma.map(({ value, _id }) => {
      const member = membersToReward.find((m) => m.id === _id);
      return `${msg.author.toString()} podziękował(a) ${member?.toString()}! Karma ${member?.toString()} wynosi ${value.toFixed(
        2,
      )} ${getEmojiForKarmaValue(value)}`;
    });

    return msg.channel.send(messages.join('\n'));
  },
};

const karma: Command = {
  name: 'karma',
  description: 'Sprawdź ile kto ma pkt. karmy.',
  args: 'optional',
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
      const agg = await getKarmaForAllMembers(db);
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
