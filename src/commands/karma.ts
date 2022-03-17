import Discord from 'discord.js';

import {
  getKarmaForMember,
  getKarmaForAllMembers,
  KarmaAgg,
  getKarmaForMembers,
  getKarmaDescription,
  isKarmaMafiaMember,
  getKarmaTypeByCommand,
  getKarmaValueByType,
} from '../data/karma';
import { getKarmaCollection, initDb } from '../db';
import type { Command } from '../types';

const KARMA_TO_ALLOW_REDUCE = 40;

export const KARMA_REGEX = new RegExp(
  `(${Discord.MessageMentions.USERS_PATTERN.source})\\s*(\\+\\+|\\-\\-)`,
);

const parseKarmaMentions = (message: string, canRecudeKarma: boolean) => {
  const parsedMentions = Array.from(message.matchAll(new RegExp(KARMA_REGEX.source, 'g')))
    .map(([, , userId, karmaCommand]) => [userId, getKarmaTypeByCommand(karmaCommand)] as const)
    .filter(([, karmaType]) => canRecudeKarma || karmaType === 'add');

  const parsedMentionsMap = new Map(parsedMentions);
  return parsedMentionsMap;
};

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

    const authorId = msg.author.id;
    const authorKarma = await getKarmaForMember(authorId, db);

    const canReduceKarma =
      Math.floor(authorKarma?.value || 0) >= KARMA_TO_ALLOW_REDUCE || isKarmaMafiaMember(authorId);
    const parsedKarmaMentions = parseKarmaMentions(msg.content, canReduceKarma);

    const mentionedMembers = Array.from(msg.mentions.members.values()).filter(
      ({ id: memberId }) =>
        parsedKarmaMentions.has(memberId) &&
        (memberId !== authorId || isKarmaMafiaMember(authorId)),
    );

    if (mentionedMembers.length === 0) {
      return null;
    }

    await karmaCollection.insertMany(
      mentionedMembers.map((m) => {
        const karmaType = parsedKarmaMentions.get(m.id)!;
        const karmaValue = getKarmaValueByType(karmaType);

        return {
          from: authorId,
          to: m.id,
          createdAt: new Date(),
          value: karmaValue,
        };
      }),
    );

    const membersKarma = await getKarmaForMembers(
      db,
      mentionedMembers.map((m) => m.id),
    );

    const messages = membersKarma.map(({ value, _id }) => {
      const member = mentionedMembers.find((m) => m.id === _id)!;
      const karmaType = parsedKarmaMentions.get(member.id)!;
      const karmaTypeDescription = karmaType === 'add' ? 'podziękował(a)' : 'ukarał(a)';

      return `${msg.author.toString()} ${karmaTypeDescription} ${member?.toString()}! ${member?.toString()} ma ${getKarmaDescription(
        value,
      )}`;
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

      return msg.channel.send(`${member.displayName} ma ${getKarmaDescription(value)}`);
    } else {
      const agg = await getKarmaForAllMembers(db);
      const data = agg.filter((el): el is KarmaAgg => !!el);
      await Promise.allSettled(data.map(({ _id: memberId }) => msg.guild?.members.fetch(memberId)));

      const messages = [
        `**TOP 10 karma**`,
        ...data.map(({ _id: memberId, value }, index) => {
          const name = msg.guild?.members.cache.get(memberId)?.displayName ?? '';
          return `\`${(index + 1).toString().padStart(2, ' ')}\`. ${name}\
 – ${getKarmaDescription(value)}`;
        }),
      ];

      return msg.channel.send(messages.join('\n'));
    }
  },
};

export { addKarma, karma };
