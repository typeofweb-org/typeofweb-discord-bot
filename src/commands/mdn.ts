import { Command } from '../types';
import fetch from 'node-fetch';

const mdn: Command = {
  name: 'mdn',
  description: 'Wyszukuje podane wyrażenia na MDN',
  args: true,
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(`https://developer.mozilla.org/api/v1/search?q=${query}&locale=en-US`);
    const data = (await res.json()) as MDNResponse;

    if (!data || !data?.documents?.length) {
      return msg.channel.send(`Niestety nic nie znalazłem 😭`);
    }

    const firstDocument = data.documents[0];
    return msg.channel.send([
      firstDocument.excerpt,
      `https://developer.mozilla.org/${firstDocument.mdn_url}`,
    ]);
  },
};

export default mdn;

interface MDNResponse {
  query: string;
  locale: string;
  page: number;
  pages: number;
  start: number;
  end: number;
  next: string | null;
  previous: string | null;
  count: number;
  filters: Filter[];
  documents: Document[];
}

interface Document {
  id: number;
  title: string;
  slug: string;
  locale: string;
  url: string;
  edit_url: string;
  excerpt: string;
  tags: string[];
  score: number;
  parent: {};
  mdn_url: string;
}

interface Filter {
  name: string;
  slug: string;
  options: Option[];
}

interface Option {
  name: string;
  slug: string;
  count: number;
  active: boolean;
  urls: Urls;
}

interface Urls {
  active: string;
  inactive: string;
}
