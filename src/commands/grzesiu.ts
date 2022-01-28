import { Command } from '../types';
import { Configuration, OpenAIApi } from 'openai';
import grzesJson from '../../grzes.json';

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
    const prompt = await generateGrzesiuPrompt(username, args.join(' '));

    // const engine = 'text-davinci-001';
    const engine = 'text-babbage-001';
    const response = await openai.createCompletion(engine, {
      prompt,
      temperature: 1,
      max_tokens: RESPONSE_TOKENS,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 2,
      best_of: 4,
    });

    if (!response.data.choices?.[0]?.text) {
      return msg.channel.send(`Niestety, Grzesiu nie miał nic do powiedzenia!`);
    }

    const messages = response.data.choices[0].text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith(`${GRZESIU_NAME}:`))
      .flatMap((l) => l.split(`${GRZESIU_NAME}:`))
      .filter((l) => l.trim().length > 0);

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

const getRandomIndices = (num: number, max: number) => {
  const set = new Set<number>();
  while (set.size < num) set.add(getRandomInt(max));
  return [...set];
};

const generateGrzesiuPrompt = async (username: string, question: string) => {
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
