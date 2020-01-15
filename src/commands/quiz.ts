import { Command } from '../types';
import fetch from 'node-fetch';

const MAX_QUESTIONS = 10;
const USAGE_MESSAGE = `Format: !quiz język poziom(opcjonalny) ilość(opcjonalny).
Dostępne wartości:
* język: html, css, js, angular, react, git, other
* poziom: junior, mid, senior
* ilość: [1 - ${MAX_QUESTIONS}] - ile pytań wylosować
`;

const Levels = ['junior', 'mid', 'senior'];
const Languages = ['html', 'css', 'js', 'angular', 'react', 'git', 'other'];

const quiz: Command = {
  name: 'quiz',
  description: 'Odpowiedz na pytanie',
  args: true,
  async execute(msg, args) {
    const [language, level, amount = '1'] = args;

    const errorMsg = validateParams(language, level, amount);
    if (errorMsg) {
      return msg.channel.send(`${errorMsg} \`\`\`${USAGE_MESSAGE}\`\`\``);
    }

    const url = prepareUrl(language, level);
    const result = await fetch(url);
    const data = (await result.json()) as DevFAQResponse;

    const {
      data: questions,
      meta: { total },
    } = data;

    if (total === 0) {
      return msg.channel.send(`Niestety nie znalazłam pytań 😭`);
    }

    const randomPivot = 0.5;
    const shuffled = questions.sort(() => randomPivot - Math.random());
    const selected = shuffled.slice(0, Number(amount));
    const resQuestions = selected.map(
      (item, index) => `**Pytanie ${index + 1}:**   ${item.question}`
    );

    return msg.channel.send(resQuestions);
  },
};

const validateParams = (language: string, level: string, amount: string) => {
  if (!language || !Languages.includes(language)) {
    return `Nie znalazłam takiego języka 😭`;
  }
  if (level && !Levels.includes(level)) {
    return `Nie znalazłam takiego poziomu 😭`;
  }
  if (amount && (Number(amount) < 0 || Number(amount) > MAX_QUESTIONS)) {
    return `Maksymalnie możesz poprosić o ${MAX_QUESTIONS} pytań.`;
  }

  return '';
};

const prepareUrl = (language: string, level: string) => {
  const urlBase: string = `https://api.devfaq.pl/questions?category=${language}`;
  if (level) {
    return `${urlBase}&level=${level}`;
  }

  return urlBase;
};

export default quiz;

interface DevFAQResponse {
  data: DevFAQ[];
  meta: {
    total: number;
  };
}

interface DevFAQ {
  id: number;
  question: string;
  _categoryId: string;
  _levelId: string;
  _statusId: string;
  acceptedAt: string;
  currentUserVotedOn: boolean;
}
