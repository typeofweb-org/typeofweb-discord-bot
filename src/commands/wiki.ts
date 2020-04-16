import Discord from 'discord.js';
import { Command } from '../types';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';

const wiki: Command = {
  name: 'wiki',
  description: 'Zwraca pierwszy wynik wyszukiwania w wikipedii',
  args: true,
  async execute(msg: Discord.Message, args: string[]) {
    if (!args.length) {
      return msg.channel.send('Nie wiem czego mam szukać 🤔 \n`!wiki <query phrase>`');
    }
    const API_URL = 'https://pl.wikipedia.org/w/api.php';
    const params = {
      action: 'opensearch',
      search: encodeURIComponent(args.join(' ')),
      limit: '1', // Limits to first search hit, add as argument in future?
      format: 'json',
    };

    const query = new URLSearchParams(params).toString();

    const res = await fetch(`${API_URL}?${query}`);

    const [queryString, [articleTitle], [], [link]]: WikipediaResponse = await res.json();

    if (!articleTitle.length && !link.length) {
      return msg.channel.send(`Nic nie znalazłam pod hasłem ${queryString}`);
    }

    const message = `Pod hasłem ${queryString} znalazłam artykuł ${articleTitle} dostępny tutaj: ${link}`;

    return msg.channel.send(message);
  },
};

export default wiki;

type WikipediaResponse = [string, string[], string[], string[]];
