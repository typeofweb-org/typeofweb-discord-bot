import fetch from 'node-fetch';

import type { Command } from '../types';

const mdn: Command = {
  name: 'mdn',
  description: 'Wyszukuje podane wyrażenia na MDN',
  args: 'required',
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const res = await fetch(
      `https://developer.mozilla.org/en-US/search.json?locale=en-US&highlight=false&q=${query}`,
    );
    const data = (await res.json()) as MDNResponse;
    if (!data.documents.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }

    const firstDocument = data.documents[0];
    return msg.channel.send(
      [
        firstDocument.excerpt,
        `https://developer.mozilla.org/en-US/docs/${firstDocument.slug}`,
      ].join('\n'),
    );
  },
};

export default mdn;

interface MDNResponse {
  readonly query: string;
  readonly locale: string;
  readonly page: number;
  readonly pages: number;
  readonly start: number;
  readonly end: number;
  readonly next: string | null;
  readonly previous: string | null;
  readonly count: number;
  readonly filters: readonly Filter[];
  readonly documents: readonly Document[];
}

interface Document {
  readonly id: number;
  readonly title: string;
  readonly slug: string;
  readonly locale: string;
  readonly url: string;
  readonly edit_url: string;
  readonly excerpt: string;
  readonly tags: readonly string[];
  readonly score: number;
  readonly parent: {};
}

interface Filter {
  readonly name: string;
  readonly slug: string;
  readonly options: readonly Option[];
}

interface Option {
  readonly name: string;
  readonly slug: string;
  readonly count: number;
  readonly active: boolean;
  readonly urls: Urls;
}

interface Urls {
  readonly active: string;
  readonly inactive: string;
}
