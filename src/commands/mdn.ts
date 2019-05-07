import Discord from 'discord.js';
import { Command } from '../types';
import fetch from 'node-fetch';

const link: Command = {
  name: 'mdn',
  description: 'Wyszukuje podane wyrażenia na MDN',
  args: true,
  async execute(msg: Discord.Message, args) {
    msg.channel.startTyping();
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(
      `https://developer.mozilla.org/en-US/search.json?locale=en-US&highlight=false&q=${query}`
    );
    const data = (await res.json()) as MDNResponse;
    if (!data.documents.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }

    const firstDocument = data.documents[0];
    return msg.channel.send([firstDocument.excerpt, firstDocument.url]);
  },
};

export default link;

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
