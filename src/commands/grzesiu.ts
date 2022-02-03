import { Command } from '../types';
import { Configuration, OpenAIApi } from 'openai';
import Fsp from 'fs/promises';
import Path from 'path';
import Natural from 'natural';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const MAX_TOKENS = 2049;
const RESPONSE_TOKENS = 64;
const MAX_GENERATED_CONTENT_LEN = Math.floor((MAX_TOKENS - RESPONSE_TOKENS) / 2); // make it cheaper
const BANNED_PATTERNS = /[`\[\]{}\(\)]|http/g;
const COOLDOWN = 20;
const GRZESIU_DELAY = 1500;
const GRZESIU_NAME = 'grzegorz';

const grzesiu: Command = {
  name: 'grzesiu',
  description: 'Użyj tego, gdy tęsknisz za Grzesiem',
  args: 'optional',
  cooldown: COOLDOWN,
  async execute(msg, args) {
    const username = (msg.member?.displayName || msg.author.username).trim().split(/\s/)[0];
    const question = args.join(' ');

    const grzesJson = JSON.parse(
      await Fsp.readFile(Path.join(__dirname, '..', '..', 'grzes.json'), 'utf-8'),
    ) as string[];

    const generators = {
      getGrzesiuAnswerFromOpenAI,
      getRandomGrzesiuAnswers,
    };

    const messages = await generators.getRandomGrzesiuAnswers(username, question, grzesJson);

    if (!messages.length) {
      return msg.channel.send(`Niestety, Grzesiu nie miał nic do powiedzenia!`);
    }

    return messages.reduce(async (acc, message) => {
      await acc;
      await msg.channel.send(`_${message}_`);
      await wait(200 + Math.random() * GRZESIU_DELAY);
      return null;
    }, Promise.resolve(null));
  },
};

export default grzesiu;

const getRandomInt = (len: number) => Math.floor(Math.random() * len);

interface GrzesiuGenerator {
  (username: string, question: string, grzesJson: string[]): Promise<string[]>;
}

// random
const getRandomGrzesiuAnswers: GrzesiuGenerator = async (_username, question, grzesJson) => {
  const g = grzesJson
    .map((l) => l.trim())
    .filter((line) => !BANNED_PATTERNS.test(line) && line.length > 0);

  const potentialItems =
    question.trim().length > 0 ? g.filter((l) => Natural.DiceCoefficient(question, l) > 0.35) : [];

  const initialIndex =
    potentialItems.length > 0 ? g.indexOf(potentialItems[getRandomInt(potentialItems.length)]) : -1;

  const MAX_LINES = 5;
  const numberOfLines = 5 - Math.floor(Math.log2(Math.floor(Math.random() * 2 ** MAX_LINES) + 1));

  const lines = [];
  let idx = initialIndex === -1 ? getRandomInt(g.length) : initialIndex;

  for (let i = 0; i < numberOfLines; ++i) {
    lines.push(g[idx]);

    if (Math.random() < 0.9 && idx < g.length) {
      ++idx;
    } else {
      idx = getRandomInt(g.length);
    }
  }

  return lines;
};

// openAI
const getGrzesiuAnswerFromOpenAI: GrzesiuGenerator = async (username, question, grzesJson) => {
  const prompt = await generateGrzesiuPrompt(username, question, grzesJson);

  const engine = 'text-davinci-001';
  // const engine = 'text-babbage-001';
  const response = await openai.createCompletion(engine, {
    prompt,
    temperature: 1,
    max_tokens: RESPONSE_TOKENS,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 2,
    best_of: 4,
  });

  console.log(response);

  if (!response.data.choices?.[0]?.text) {
    return [];
  }

  const messages = response.data.choices[0].text
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith(`${GRZESIU_NAME}:`))
    .flatMap((l) => l.split(`${GRZESIU_NAME}:`))
    .filter((l) => l.trim().length > 0);
  return messages;
};

const getRandomIndices = (num: number, max: number) => {
  const set = new Set<number>();
  while (set.size < num) set.add(getRandomInt(max));
  return [...set];
};

const generateGrzesiuPrompt = async (username: string, question: string, grzesJson: string[]) => {
  const indices = getRandomIndices(100, grzesJson.length);
  const uniqueLines = [...new Set(indices.map((idx) => grzesJson[idx].trim()))].filter(
    (line) => !BANNED_PATTERNS.test(line) && line.length > 0,
  );

  const getFullConvo = (txt: string, username: string, question: string) => {
    if (question) {
      return `${txt.trim()}\n${username}: ${question}\n${GRZESIU_NAME}:`;
    }
    return `${txt.trim()}\n${GRZESIU_NAME}:`;
  };

  const txt = uniqueLines.reduce((txt, line) => {
    const newTxt = txt + `${GRZESIU_NAME}: ` + line + '\n';
    const fullConvo = getFullConvo(newTxt, username, question);
    return fullConvo.length <= MAX_GENERATED_CONTENT_LEN ? newTxt : txt;
  }, '');
  return getFullConvo(txt, username, question);
};
