import { Command } from '../types';
import { polishPlurals } from 'polish-plurals';
import { getConfig } from '../config';
import Algoliasearch from 'algoliasearch';
import { MessageEmbed } from 'discord.js';

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
      new MessageEmbed()
        .setTitle(h.title)
        .setURL(`https://typeofweb.com/${h.permalink}`)
        .setThumbnail(`https://typeofweb.com/${h.img.url.replace(/^\/public\//, '')}`)
        .setFooter(`https://typeofweb.com/${h.permalink}`)
        .setColor([28, 160, 86])
        .setAuthor(
          h.authors.map((a) => a.replace(/(?:^|-)(\w)/g, (_, m) => ' ' + m.toUpperCase()).trim()),
        )
        .setDescription(h.excerpt),
    );

    return results.reduce(async (acc, embed) => {
      await acc;
      return msg.channel.send({ embed });
    }, msg.channel.send(`Pokazuję pierwsze ${total} ${pluralize(total)}:`));
  },
};

export default typeofweb;

interface TypeOfWebAlgoliaResult {
  title: string;
  date: Date;
  type: string;
  permalink: string;
  authors: string[];
  excerpt: string;
  content: string;
  img: Img;
  category: Category;
}

interface Category {
  slug: string;
  name: string;
}

interface Img {
  url: string;
  width: number;
  height: number;
}
