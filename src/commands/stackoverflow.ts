import Discord from 'discord.js';
import fetch from 'node-fetch';

import type { Command } from '../types';

const ICON_URL =
  'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png';

const isApiError = (data: ApiResponse): data is ApiResponseError => 'error_id' in data;

const formatTitle = (length: number) =>
  length === 1
    ? 'najlepsza odpowiedź'
    : length < 5
    ? 'najlepsze odpowiedzi'
    : 'najlepszych odpowiedzi';

const stackoverflow: Command = {
  name: 'stackoverflow',
  description: 'Wyszukaj swój problem na stackoverflow',
  args: 'required',
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' ').toLocaleLowerCase());
    const result = await fetch(
      `https://api.stackexchange.com/2.3/search/advanced?pagesize=5&order=desc&sort=activity&q=${query}&site=stackoverflow`,
    );
    const response = (await result.json()) as ApiResponse;

    if (!result.ok || isApiError(response)) {
      return msg.channel.send('Przepraszam, ale coś poszło nie tak 😭');
    }

    const fields = response.items.map(({ title, link }) => ({
      name: title,
      value: link,
    }));

    if (fields.length === 0) {
      return msg.channel.send('Niestety nic nie znalazłem 😭');
    }

    const embed = new Discord.EmbedBuilder()
      .setAuthor({
        name: 'Stack Overflow',
        iconURL: ICON_URL,
        url: 'https://stackoverflow.com/',
      })
      .setTitle(`${fields.length} ${formatTitle(fields.length)}:`)
      .addFields(fields)
      .setColor('#f4811e');

    return msg.channel.send({ embeds: [embed] });
  },
};

export default stackoverflow;

interface ApiOwner {
  readonly account_id: number;
  readonly reputation: number;
  readonly user_id: number;
  readonly user_type: string;
  readonly profile_image: string;
  readonly display_name: string;
  readonly link: string;
}

interface ApiItem {
  readonly tags: ReadonlyArray<string>;
  readonly owner: ApiOwner;
  readonly is_answered: boolean;
  readonly view_count: number;
  readonly answer_count: number;
  readonly score: number;
  readonly last_activity_date: number;
  readonly creation_date: number;
  readonly question_id: number;
  readonly content_license: string;
  readonly link: string;
  readonly title: string;
}

interface ApiResponseSuccess {
  readonly items: ReadonlyArray<ApiItem>;
  readonly has_more: boolean;
  readonly quota_max: number;
  readonly quota_remaining: number;
}

interface ApiResponseError {
  readonly error_id: number;
  readonly error_message: string;
  readonly error_name: string;
}

type ApiResponse = ApiResponseSuccess | ApiResponseError;
