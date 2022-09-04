import { URLSearchParams } from 'url';

import type Discord from 'discord.js';
import fetch from 'node-fetch';

import { getConfig } from '../config';
import type { Command } from '../types';

const spotify: Command = {
  name: 'spotify',
  description: 'Pjosenkę gra.',
  args: 'required',
  async execute(msg: Discord.Message, args: readonly string[]) {
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
  readonly access_token: string;
  readonly token_type: string;
  readonly expires_in: number;
}

interface QueryResponse {
  readonly tracks: Tracks;
}

interface Tracks {
  readonly href: string;
  readonly items: readonly Item[];
  readonly limit: number;
  readonly next: string;
  readonly offset: number;
  readonly total: number;
}

interface Item {
  readonly album: Album;
  readonly artists: readonly Artist[];
  readonly available_markets: readonly string[];
  readonly disc_number: number;
  readonly duration_ms: number;
  readonly explicit: boolean;
  readonly external_ids: ExternalIds;
  readonly external_urls: ExternalURLs;
  readonly href: string;
  readonly id: string;
  readonly is_local: boolean;
  readonly name: string;
  readonly popularity: number;
  readonly preview_url: string;
  readonly track_number: number;
  readonly type: string;
  readonly uri: string;
}

interface ExternalIds {
  readonly isrc: string;
}

interface Album {
  readonly album_type: string;
  readonly artists: readonly Artist[];
  readonly available_markets: readonly string[];
  readonly external_urls: ExternalURLs;
  readonly href: string;
  readonly id: string;
  readonly images: readonly Image[];
  readonly name: string;
  readonly release_date: string;
  readonly release_date_precision: string;
  readonly total_tracks: number;
  readonly type: string;
  readonly uri: string;
}

interface Image {
  readonly height: number;
  readonly url: string;
  readonly width: number;
}

interface Artist {
  readonly external_urls: ExternalURLs;
  readonly href: string;
  readonly id: string;
  readonly name: string;
  readonly type: string;
  readonly uri: string;
}

interface ExternalURLs {
  readonly spotify: string;
}
