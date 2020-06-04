import { Command } from '../types';

const MAX_COUNT = 20;
const MAX_DICE = 100;
const REGEX = /([0-9]{1,4})d([0-9]{1,4})([+-][0-9]{1,10})?/;

export function parseDice(arg: string) {
  const res = arg.match(REGEX);
  if (res == null) {
    throw new Error('Invalid argument');
  }
  const [notation, count, dice, modifier] = res;
  return {
    notation,
    count: parseInt(count, 10),
    dice: parseInt(dice, 10),
    modifier: parseInt(modifier ?? 0, 10),
  };
}

export function rollDices(content: string) {
  const parsed = parseDice(content);
  if (parsed.count <= 0 || parsed.count > MAX_COUNT || parsed.dice <= 0 || parsed.dice > MAX_DICE) {
    throw new Error('Invalid argument values');
  }
  const rolls = Array.from({ length: parsed.count })
    .map(() => Math.random() * parsed.dice + 1)
    .map(Math.floor);
  return {
    notation: parsed.notation,
    value: rolls.reduce((acc, val) => acc + val, parsed.modifier),
    rolls,
  };
}

const instruction =
  'Wpisz `!roll [liczba kości]d[liczba ścian]`, aby rzucić kośćmi, np `!roll 2d6+1`';

const roll: Command = {
  name: 'roll',
  description: 'Rzuca kośćmi.',
  args: true,
  execute(msg, args) {
    try {
      const result = rollDices(args[0]);
      const rollsResult = `${result.rolls.join('+')}`;
      const response = `:game_die: [${result.notation}] **${result.value}** = ${rollsResult}`;
      return msg.channel.send(response);
    } catch (error) {
      return msg.channel.send(instruction);
    }
  },
};

export default roll;
