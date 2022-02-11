import fetch from 'node-fetch';
import Fsp from 'fs/promises';
import Path from 'path';
import Natural from 'natural';

import type { Command } from '../types';

const xkcd: Command = {
  name: 'xkcd',
  description: 'Wyszukuje video z xkcd',
  args: 'required',
  async execute(msg, args) {
    const parsedArgs = parseXkcdArgs(args);

    if (parsedArgs.type === 'id') {
      const res = await fetch(`https://xkcd.com/${parsedArgs.id}/info.0.json`);
      if (res.status === 404) {
        return msg.channel.send(`Niestety nic nie znalazłam 😭`);
      }
      return msg.channel.send(`https://xkcd.com/${parsedArgs.id}/`);
    }

    const xkcdCache = JSON.parse(
      await Fsp.readFile(Path.join(__dirname, 'xkcd.cache.json'), 'utf-8'),
    ) as { lastUpdatedAt: string; data: Record<number, XkcdResponse> };

    const foundXkcd = Object.entries(xkcdCache.data)
      .map(([id, response]) => {
        const titleCoeff = Natural.DiceCoefficient(response.safe_title, parsedArgs.query);
        if (titleCoeff === 1) {
          return [id, Number.MAX_SAFE_INTEGER] as const;
        }

        const altCoeff = Natural.DiceCoefficient(response.alt, parsedArgs.query);
        const transcriptCoeff = Natural.DiceCoefficient(response.transcript, parsedArgs.query);
        // if (['386', '195', '80'].includes(id)) {
        //   console.log({
        //     id,
        //     titleCoeff,
        //     altCoeff,
        //     transcriptCoeff,
        //     sum: 0.05 * titleCoeff + 0.05 * altCoeff + 0.9 * transcriptCoeff,
        //   });
        // }
        const weightedCoeff = 0.05 * titleCoeff + 0.05 * altCoeff + 0.9 * transcriptCoeff;
        return [id, weightedCoeff] as const;
      })
      .sort(([, a], [, b]) => b - a)[0];

    // const result = await fetch();
    // const response = await result.json();

    if (!foundXkcd) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }

    return msg.channel.send(`https://xkcd.com/${foundXkcd[0]}/`);
  },
};

export default xkcd;

function parseXkcdArgs(args: readonly string[]) {
  const trimmedArgs = args.map((el) => el.trim()).filter((el) => el.length > 0);

  if (trimmedArgs.length === 1 && /^\d+$/.test(trimmedArgs[0])) {
    return { type: 'id', id: trimmedArgs[0] } as const;
  }

  return { type: 'search', query: trimmedArgs.join(' ') } as const;
}

interface XkcdResponse {
  month: string;
  num: number;
  link: string;
  year: string;
  news: string;
  safe_title: string;
  transcript: string;
  alt: string;
  img: string;
  title: string;
  day: string;
}
