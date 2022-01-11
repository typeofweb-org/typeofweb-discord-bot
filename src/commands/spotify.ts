import Discord from 'discord.js';
import { Command } from '../types';
import fetch from 'node-fetch';
import { URLSearchParams } from 'url';
import { getConfig } from '../config';

const spotify: Command = {
  name: 'spotify',
  description: 'Pjosenkę gra.',
  args: 'required',
  async execute(msg: Discord.Message, args: string[]) {
    const secret = Buffer.from(
      `${getConfig('SPOTIFY_CLIENT_ID')}:${getConfig('SPOTIFY_SECRET')}`,
    ).toString('base64');

    const query = encodeURIComponent(args.join(' '));
    const searchParams = new URLSearchParams();
    searchParams.set('grant_type', 'client_credentials');

    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: searchParams,
      headers: {
        Authorization: `Basic ${secret}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token } = (await res.json()) as TokenResponse;
    const results = await fetch(
      `https://api.spotify.com/v1/search/?q=${query}&type=track&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      },
    );

    const {
      tracks: { items },
    } = (await results.json()) as QueryResponse;

    return items[0]
      ? msg.channel.send(items[0].external_urls.spotify)
      : msg.channel.send('Niestety nic nie znalazłam 🎷');
  },
};

export default spotify;

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface QueryResponse {
  tracks: Tracks;
}

interface Tracks {
  href: string;
  items: Item[];
  limit: number;
  next: string;
  offset: number;
  total: number;
}

interface Item {
  album: Album;
  artists: Artist[];
  available_markets: string[];
  disc_number: number;
  duration_ms: number;
  explicit: boolean;
  external_ids: ExternalIds;
  external_urls: ExternalURLs;
  href: string;
  id: string;
  is_local: boolean;
  name: string;
  popularity: number;
  preview_url: string;
  track_number: number;
  type: string;
  uri: string;
}

interface ExternalIds {
  isrc: string;
}

interface Album {
  album_type: string;
  artists: Artist[];
  available_markets: string[];
  external_urls: ExternalURLs;
  href: string;
  id: string;
  images: Image[];
  name: string;
  release_date: string;
  release_date_precision: string;
  total_tracks: number;
  type: string;
  uri: string;
}

interface Image {
  height: number;
  url: string;
  width: number;
}

interface Artist {
  external_urls: ExternalURLs;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
}

interface ExternalURLs {
  spotify: string;
}
