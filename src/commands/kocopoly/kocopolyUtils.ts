import Natural from 'natural';
import { Configuration, OpenAIApi } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const MAX_TOKENS = 2049;
const RESPONSE_TOKENS = 64;

const MAX_GENERATED_CONTENT_LEN = Math.floor((MAX_TOKENS - RESPONSE_TOKENS) / 2); // make it cheaper
const BANNED_PATTERNS = /[`\[\]{}\(\)]|http/g;

const getRandomInt = (len: number) => Math.floor(Math.random() * len);

interface KocopolyGenerator {
  (username: string, question: string, kocopolyJson: readonly string[], kocopolyName: string):
    | readonly string[]
    | Promise<readonly string[]>;
}

// random
export const getRandomKocopolyAnswers: KocopolyGenerator = (
  _username,
  question,
  kocopolyJson,
  _kocopolyName,
) => {
  const g = kocopolyJson
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

  // eslint-disable-next-line functional/no-loop-statement
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
export const getKocopolyAnswerFromOpenAI: KocopolyGenerator = async (
  username,
  question,
  kocopolyJson,
  kocopolyName,
) => {
  const prompt = generateKocopolyPrompt(username, question, kocopolyJson, kocopolyName);

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
    .filter((l) => l.startsWith(`${kocopolyName}:`))
    .flatMap((l) => l.split(`${kocopolyName}:`))
    .filter((l) => l.trim().length > 0);
  return messages;
};

const getRandomIndices = (num: number, max: number) => {
  const set = new Set<number>();
  // eslint-disable-next-line functional/no-loop-statement
  while (set.size < num) set.add(getRandomInt(max));
  return [...set];
};

const generateKocopolyPrompt = (
  username: string,
  question: string,
  kocopolyJson: readonly string[],
  kocopolyName: string,
) => {
  const indices = getRandomIndices(100, kocopolyJson.length);
  const uniqueLines = [...new Set(indices.map((idx) => kocopolyJson[idx].trim()))].filter(
    (line) => !BANNED_PATTERNS.test(line) && line.length > 0,
  );

  const getFullConvo = (txt: string, username: string, question: string) => {
    if (question) {
      return `${txt.trim()}\n${username}: ${question}\n${kocopolyName}:`;
    }
    return `${txt.trim()}\n${kocopolyName}:`;
  };

  const txt = uniqueLines.reduce((txt, line) => {
    const newTxt = txt + `${kocopolyName}: ` + line + '\n';
    const fullConvo = getFullConvo(newTxt, username, question);
    return fullConvo.length <= MAX_GENERATED_CONTENT_LEN ? newTxt : txt;
  }, '');
  return getFullConvo(txt, username, question);
};
