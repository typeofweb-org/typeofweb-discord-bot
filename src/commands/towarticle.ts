import { Command } from '../types';
import fetch from 'node-fetch';
import { polishPlurals } from 'polish-plurals';

const MAX_RESULTS_NUMBER = 3;

const pluralize = (count: number) => polishPlurals('artykuł', 'artykuły', 'artykułów', count);

const typeofweb: Command = {
  name: 'typeofweb',
  description: 'Wyszukuje artykuły z Type of Web',
  args: true,
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(`https://typeofweb.com/wp-json/wp/v2/search?search=${query}`);

    const data = (await res.json()) as ToWSearchResponse[];
    if (!data[0].url.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }
    const total = data[0].url.length;
    const message =
      `Znalazłam ${total} ${pluralize(total)}` +
      (total > MAX_RESULTS_NUMBER ? `. Pokazuję pierwsze ${MAX_RESULTS_NUMBER} ` : '') +
      ':';

    const article = data.slice(0, MAX_RESULTS_NUMBER);
    return msg.channel.send([message, ...article.map(doc => doc.url)]);
  },
};

export default typeofweb;

interface ToWSearchResponse {
  id: number;
  title: string;
  url: string;
  type: string;
  subtype: string;
  _links: Links;
}

interface Links {
  self: Self[];
  about: About[];
  collection: Collection[];
}

interface Self {
  embeddable: boolean;
  href: string;
}

interface About {
  href: string;
}

interface Collection {
  href: string;
}
