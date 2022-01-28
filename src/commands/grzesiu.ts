import { Command } from '../types';
import { Configuration, OpenAIApi } from 'openai';
import grzesJson from '../../grzes.json';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const BANNED_PATTERNS = /[`\[\]{}\(\)]|http/g;
const COOLDOWN = 60;
const GRZESIU_DELAY = 1500;

const grzesiu: Command = {
  name: 'grzesiu',
  description: 'Użyj tego, gdy tęsknisz za Grzesiem',
  args: 'prohibited',
  cooldown: COOLDOWN,
  async execute(msg) {
    const prompt = await generateGrzesiuPrompt();

    const response = await openai.createCompletion('text-davinci-001', {
      prompt,
      temperature: 1,
      max_tokens: 64,
      top_p: 1,
      best_of: 4,
      frequency_penalty: 0,
      presence_penalty: 2,
    });

    if (!response.data.choices?.[0]?.text) {
      return msg.channel.send(`Niestety, Grzesiu nie miał nic do powiedzenia!`);
    }

    const messages = response.data.choices[0].text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    return messages.reduce(async (acc, message) => {
      await acc;
      await msg.channel.send(`_${message}_`);
      await wait(200 + Math.random() * GRZESIU_DELAY);
      return null;
    }, Promise.resolve(null));
  },
};

export default grzesiu;

const MAX_TOKENS = 2049;

const getRandomInt = (len: number) => Math.floor(Math.random() * len);

const getRandomIndices = (num: number, max: number) => {
  const set = new Set<number>();
  while (set.size < num) set.add(getRandomInt(max));
  return [...set];
};

const generateGrzesiuPrompt = async () => {
  const indices = getRandomIndices(100, grzesJson.length);
  const uniqueLines = [...new Set(indices.map((idx) => grzesJson[idx].trim()))].filter(
    (line) => !BANNED_PATTERNS.test(line) && line.length > 0,
  );

  const prompt = uniqueLines.reduce((txt, line) => {
    const newTxt = txt + line + '\n';
    return newTxt.length <= MAX_TOKENS ? newTxt : txt;
  }, '');
  return prompt;
};
