import { Command } from '../types';
import fetch from 'node-fetch';
import { polishPlurals } from 'polish-plurals';

const pluralize = (count: number) => polishPlurals('artykuł', 'artykuły', 'artykułów', count);

const typeofweb: Command = {
  name: 'typeofweb',
  description: 'Wyszukuje artykuły z Type of Web',
  args: true,
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(
      `https://typeofweb.com/wp-json/wp/v2/search?search=${query}&per_page=3`
    );

    const data = (await res.json()) as ToWSearchResponse[];
    if (!data.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }
    const total = data.length;
    const message = `Pokazuję pierwsze ${total} ${pluralize(total)}` + ':';

    const article = data.slice(0, total);
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
