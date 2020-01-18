/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import Sinon from 'sinon';

const proxyExistenceMutating = <T extends object>(obj: T, prefix = ''): T => {
  for (const key in obj) {
    if (!obj.hasOwnProperty(key)) {
      continue;
    }

    const val = obj[key] as unknown;
    if (typeof val === 'object' && val) {
      // tslint:disable-next-line: no-any
      obj[key] = proxyExistenceMutating(val, prefix ? prefix + '.' + key : key) as any;
    }
  }
  return new Proxy(obj, {
    // tslint:disable-next-line: no-any
    get(o: any, prop: string) {
      if (prop in o) {
        return o[prop];
      }

      const err = new Error(
        `The following property is missing in your mock: ${
          prefix ? prefix + '.' + String(prop) : String(prop)
        }`
      );
      console.error(err);
      throw err;
    },
  });
};

// tslint:disable-next-line: no-any
export const getMessageMock = (name: string, params: any = {}) => {
  const mockMessage = {
    ...params,
    channel: {
      sendFile: Sinon.stub(),
      send: Sinon.stub(),
      fetchMessages: Sinon.stub(),
      type: '',
      [Symbol.toStringTag]: () => 'MOCK CHANNEL',
      ...params.channel,
    },
    guild: {
      fetchMember: Sinon.stub(),
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
