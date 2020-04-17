import Discord from 'discord.js';
import { Command } from '../types';
import fetch from 'node-fetch';

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
    const query = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    const res = await fetch(`${API_URL}?${query}`);
    const resp = await res.json();
    const [queryString, [articleTitle], [], [link]]: WikipediaResponse = resp;

    if (!articleTitle.length && !link.length) {
      return msg.channel.send(`Nic nie znalazłam pod hasłem ${queryString}`);
    }
    const message = `Pod hasłem: ${queryString}\n znalazłam artykuł: ${articleTitle}\n dostępny tutaj: ${link}`;

    return msg.channel.send(message);
  },
};
export default wiki;

type WikipediaResponse = [string, string[], string[], string[]];
