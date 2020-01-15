import { Command } from '../types';
import fetch from 'node-fetch';
import { polishPlurals } from 'polish-plurals';

const MAX_RESULTS_NUMBER = 3;

const pluralize = (count: number) => polishPlurals('paczkę', 'paczki', 'paczek', count);

const npm: Command = {
  name: 'npm',
  description: 'Wyszukuje podane wyrażenia w NPM',
  args: true,
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
    return msg.channel.send([message, ...topDocuments.map(doc => doc.package.links.npm)]);
  },
};

export default npm;

interface NpmResponse {
  objects: NpmObject[];
  time: string;
  total: number;
}

interface NpmObject {
  package: Package;
  score: Score;
  searchScore: number;
  flags?: Flags;
}

interface Flags {
  unstable: boolean;
}

interface Score {
  final: number;
  detail: Detail;
}

interface Detail {
  quality: number;
  popularity: number;
  maintenance: number;
}

interface Package {
  name: string;
  scope: string;
  version: string;
  description: string;
  date: string;
  links: Links;
  publisher: Publisher;
  maintainers: Publisher[];
  keywords?: string[];
  author?: Author;
}

interface Author {
  name: string;
  email?: string;
  username?: string;
  url?: string;
}

interface Publisher {
  username: string;
  email: string;
}

interface Links {
  npm: string;
  homepage: string;
  repository: string;
  bugs: string;
}
