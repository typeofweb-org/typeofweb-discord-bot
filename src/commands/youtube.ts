import { Command } from '../types';
import fetch from 'node-fetch';

const youtube: Command = {
  name: 'youtube',
  description: 'Wyszukuje video z youtube',
  args: true,
  async execute(msg, args) {
    const query = encodeURIComponent(args.join(' '));
    const result = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=id&type=video&key=${
        process.env.YOUTUBE_API_KEY
      }&q=${query}`
    );
    const data = (await result.json()) as YoutubeResponse;
    if (!data.items.length) {
      return msg.channel.send(`Niestety nic nie znalazłam 😭`);
    }
    const { videoId: videoUrl } = data.items[0].id;
    return msg.channel.send(`https://www.youtube.com/watch?v=${videoUrl}`);
  },
};

export default youtube;

interface YoutubeResponse {
  kind: string;
  etag: string;
  nextPageToken: string;
  regionCode: string;
  pageInfo: PageInfo;
  items: YoutubeItem[];
}

interface PageInfo {
  totalResults: number;
  resultsPerPage: number;
}

interface YoutubeItem {
  kind: string;
  etag: string;
  id: YoutubeItemId;
}
interface YoutubeItemId {
  kind: string;
  videoId: string;
}
