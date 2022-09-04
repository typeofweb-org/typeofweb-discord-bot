import Algoliasearch from 'algoliasearch';
import { polishPlurals } from 'polish-plurals';
import Discord from 'discord.js';

import { getConfig } from '../config';
import type { Command } from '../types';

const pluralize = (count: number) => polishPlurals('artykuł', 'artykuły', 'artykułów', count);

const PER_PAGE = 3;

const typeofweb: Command = {
  name: 'typeofweb',
  description: 'Wyszukuje artykuły z Type of Web',
  args: 'required',
  async execute(msg, args) {
    const ALGOLIA_APP_ID = getConfig('ALGOLIA_APP_ID');
    const ALGOLIA_API_KEY = getConfig('ALGOLIA_API_KEY');
    const ALGOLIA_INDEX_NAME = getConfig('ALGOLIA_INDEX_NAME');

    const client = Algoliasearch(ALGOLIA_APP_ID, ALGOLIA_API_KEY);
    const index = client.initIndex(ALGOLIA_INDEX_NAME);

    const query = args.join(' ');
    const res = await index.search<TypeOfWebAlgoliaResult>(query, {
      hitsPerPage: PER_PAGE,
    });
    const total = res.hits.length;

    if (!total) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }

    console.log(res.hits.map((h) => h.authors));

    const results = res.hits.map((h) =>
      new Discord.EmbedBuilder()
        .setTitle(h.title)
        .setURL(`https://typeofweb.com/${h.permalink}`)
        .setThumbnail(`https://typeofweb.com/${h.img.url.replace(/^\/public\//, '')}`)
        .setFooter({
          text: '',
          iconURL: `https://typeofweb.com/${h.permalink}`,
        })
        .setColor([28, 160, 86])
        .setAuthor({
          name: h.authors
            .map((a) => a.replace(/(?:^|-)(\w)/g, (_, m: string) => ' ' + m.toUpperCase()).trim())
            .join('\n'),
        })
        .setDescription(h.excerpt),
    );

    return msg.channel.send({
      content: `Pokazuję pierwsze ${total} ${pluralize(total)}:`,
      embeds: results,
    });
  },
};

export default typeofweb;

interface TypeOfWebAlgoliaResult {
  readonly title: string;
  readonly date: Date;
  readonly type: string;
  readonly permalink: string;
  readonly authors: readonly string[];
  readonly excerpt: string;
  readonly content: string;
  readonly img: Img;
  readonly category: Category;
}

interface Category {
  readonly slug: string;
  readonly name: string;
}

interface Img {
  readonly url: string;
  readonly width: number;
  readonly height: number;
}
