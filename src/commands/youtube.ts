import fetch from 'node-fetch';

import { getConfig } from '../config';
import type { Command } from '../types';

const isErrorResponse = (response: YoutubeResponse): response is YoutubeResponseError =>
  'error' in response;

const youtube: Command = {
  name: 'youtube',
  description: 'Wyszukuje video z youtube',
  args: 'required',
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const YOUTUBE_API_KEY = getConfig('YOUTUBE_API_KEY');
    const result = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&key=${YOUTUBE_API_KEY}&q=${query}`,
    );
    const response = (await result.json()) as YoutubeResponse;

    if (isErrorResponse(response)) {
      console.error(response);
      return msg.channel.send(`Uh, integracja z API YT nie zadziałała 😭`);
    }

    if (!response.items.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }

    const [
      {
        id: { videoId },
      },
    ] = response.items;
    return msg.channel.send(`https://www.youtube.com/watch?v=${videoId}`);
  },
};

export default youtube;

interface YoutubeResponseError {
  readonly error: unknown;
}

interface YoutubeResponseSuccess {
  readonly kind: string;
  readonly etag: string;
  readonly nextPageToken: string;
  readonly regionCode: string;
  readonly pageInfo: PageInfo;
  readonly items: ReadonlyArray<YoutubeItem>;
}

interface PageInfo {
  readonly totalResults: number;
  readonly resultsPerPage: number;
}

interface YoutubeItem {
  readonly kind: string;
  readonly etag: string;
  readonly id: YoutubeItemId;
}
interface YoutubeItemId {
  readonly kind: string;
  readonly videoId: string;
}

type YoutubeResponse = YoutubeResponseSuccess | YoutubeResponseError;
