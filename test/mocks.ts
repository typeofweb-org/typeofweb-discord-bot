/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint no-magic-numbers: "off" */

import type { Message } from 'discord.js';
import Sinon from 'sinon';

const proxyExistenceMutating = <T extends object>(obj: T, prefix = ''): T => {
  // eslint-disable-next-line functional/no-loop-statement
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const val = obj[key] as unknown;
    if (typeof val === 'object' && val) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      obj[key] = proxyExistenceMutating(val, prefix ? prefix + '.' + key : key) as any;
    }
  }
  return new Proxy(obj, {
    get(o: any, prop: string) {
      if (prop in o) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        return o[prop];
      }

      const err = new Error(
        `The following property is missing in your mock: ${
          prefix ? prefix + '.' + String(prop) : String(prop)
        }`,
      );
      console.error(err);
      throw err;
    },
  });
};

export const getMessageMock = <T extends Message, P extends { readonly [K in keyof T]?: any }>(
  name: string,
  // @ts-ignore
  params: P = {},
) => {
  const mockMessage = {
    ...(params as {}),
    channel: {
      bulkDelete: Sinon.stub(),
      send: Sinon.stub(),
      messages: { fetch: Sinon.stub() },
      type: '',
      [Symbol.toStringTag]: () => 'MOCK CHANNEL',
      ...(params.channel as {}),
    },
    guild: {
      members: {
        cache: { get: Sinon.stub() },
      },
      ...(params.guild as {}),
    },
    delete: Sinon.stub(),
    author: {
      id: '123',
      send: Sinon.stub(),
      ...(params.author as {}),
    },
    reply: Sinon.stub(),
  } as const;
  return proxyExistenceMutating(mockMessage, name) as typeof mockMessage & P;
};

export const getMemberMock = () => {
  const id = (Math.random() * 1e18).toFixed();

  const mention = `<@${id}>`;

  return { id, mention };
};
