import Fsp from 'fs/promises';
import Path from 'path';

import type { Command, CommandWithArgs } from '../types';
import { capitalizeFirst, wait } from '../utils';

import { getRandomKocopolyAnswers } from './kocopoly/kocopolyUtils';

const COOLDOWN = 20;
const KOCOPOLY_DELAY = 1500;

const kocopolyExecute =
  (kocopolyFilename: string, kocopolyName: string): CommandWithArgs['execute'] =>
  async (msg, args) => {
    const username = (msg.member?.displayName || msg.author.username).trim().split(/\s/)[0];
    const question = args.join(' ');

    const kocopolyJson = JSON.parse(
      await Fsp.readFile(Path.join(__dirname, '..', kocopolyFilename), 'utf-8'),
    ) as readonly string[];

    const messages = await getRandomKocopolyAnswers(username, question, kocopolyJson, kocopolyName);

    if (!messages.length) {
      return msg.channel.send(
        `Niestety, ${capitalizeFirst(kocopolyName)} nie miał nic do powiedzenia!`,
      );
    }

    return messages.reduce(async (acc, message) => {
      await acc;
      await msg.channel.send(`_${message}_`);
      await wait(200 + Math.random() * KOCOPOLY_DELAY);
      return null;
    }, Promise.resolve(null));
  };

export const grzesiu: Command = {
  name: 'grzesiu',
  description: 'Użyj tego, gdy tęsknisz za Grzesiem',
  args: 'optional',
  cooldown: COOLDOWN,
  execute: kocopolyExecute('grzes.json', 'grzegorz'),
};

export const morritz: Command = {
  name: 'morritz',
  description: 'Użyj tego, gdy tęsknisz za Morritzem',
  args: 'optional',
  cooldown: COOLDOWN,
  execute: kocopolyExecute('morritz.json', 'morritz'),
};
