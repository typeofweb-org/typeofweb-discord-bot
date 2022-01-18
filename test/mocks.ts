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

export const getMessageMock = <T extends Message>(
  name: string,
  params: { readonly [K in keyof T]?: any } = {},
) => {
  const mockMessage = {
    ...params,
    channel: {
      bulkDelete: Sinon.stub(),
      send: Sinon.stub(),
      messages: { fetch: Sinon.stub() },
      type: '',
      [Symbol.toStringTag]: () => 'MOCK CHANNEL',
      ...params.channel,
    },
    guild: {
      member: Sinon.stub(),
      ...params.guild,
    },
    delete: Sinon.stub(),
    author: {
      send: Sinon.stub(),
      ...params.author,
    },
    reply: Sinon.stub(),
  };
  return proxyExistenceMutating(mockMessage, name);
};

export const getMemberMock = () => {
  // Math.pow due to Discord.MessageMentions.USERS_PATTERN regex: <@!?(\d{17,19})>
  const id = (Math.random() * Math.pow(10, 18)).toFixed();

  const mention = `<@${id}>`;

  return { id, mention };
};
