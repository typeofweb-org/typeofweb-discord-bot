import fetch from 'node-fetch';
import { polishPlurals } from 'polish-plurals';

import type { Command } from '../types';

const MAX_RESULTS_NUMBER = 3;

const pluralize = (count: number) => polishPlurals('paczkę', 'paczki', 'paczek', count);

const npm: Command = {
  name: 'npm',
  description: 'Wyszukuje podane wyrażenia w NPM',
  args: 'required',
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(`http://registry.npmjs.com/-/v1/search?text=${query}`);

    const { objects, total } = (await res.json()) as NpmResponse;
    if (!objects.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }
    const message =
      `Znalazłam ${total} ${pluralize(total)}` +
      (total > MAX_RESULTS_NUMBER ? `. Pokazuję pierwsze ${MAX_RESULTS_NUMBER}` : '') +
      ':';

    const topDocuments = objects.slice(0, MAX_RESULTS_NUMBER);
    return msg.channel.send(
      [message, ...topDocuments.map((doc) => doc.package.links.npm)].join('\n'),
    );
  },
};

export default npm;

interface NpmResponse {
  readonly objects: readonly NpmObject[];
  readonly time: string;
  readonly total: number;
}

interface NpmObject {
  readonly package: Package;
  readonly score: Score;
  readonly searchScore: number;
  readonly flags?: Flags;
}

interface Flags {
  readonly unstable: boolean;
}

interface Score {
  readonly final: number;
  readonly detail: Detail;
}

interface Detail {
  readonly quality: number;
  readonly popularity: number;
  readonly maintenance: number;
}

interface Package {
  readonly name: string;
  readonly scope: string;
  readonly version: string;
  readonly description: string;
  readonly date: string;
  readonly links: Links;
  readonly publisher: Publisher;
  readonly maintainers: readonly Publisher[];
  readonly keywords?: readonly string[];
  readonly author?: Author;
}

interface Author {
  readonly name: string;
  readonly email?: string;
  readonly username?: string;
  readonly url?: string;
}

interface Publisher {
  readonly username: string;
  readonly email: string;
}

interface Links {
  readonly npm: string;
  readonly homepage: string;
  readonly repository: string;
  readonly bugs: string;
}
