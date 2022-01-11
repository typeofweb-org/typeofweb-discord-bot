import { thx } from './thx';
import { expect } from 'chai';
import * as Discord from 'discord.js';
import { getMessageMock } from '../test/mocks';

describe('thx', () => {
  let id = 0;

  it('it should ignore random messages', async () => {
    const msg = getMessageMock('msg', { content: 'msg', channel: { id: ++id } });
    msg.reply.resolves();

    await thx(msg as unknown as Discord.Message);

    expect(msg.reply).not.to.have.been.calledOnceWith(
      'protip: napisz `@nazwa ++`, żeby komuś podziękować!',
    );
  });

  it('it should respond to thanks', async () => {
    const msg = getMessageMock('msg', { content: 'dzięki', channel: { id: ++id } });
    msg.reply.resolves();

    await thx(msg as unknown as Discord.Message);

    expect(msg.reply).to.have.been.calledOnceWith(
      'protip: napisz `@nazwa ++`, żeby komuś podziękować!',
    );
  });

  [
    'dzięki temu',
    'dzięki Tobie',
    'dzięki tobie',
    'dzięki niemu',
    'dzięki Niemu',
    'dzięki Niej',
    'dzięki niej',
  ].forEach((text) =>
    it(`it should ignore exception: ${text}`, async () => {
      const msg = getMessageMock('msg', { content: text, channel: { id: ++id } });
      msg.reply.resolves();
      await thx(msg as unknown as Discord.Message);

      expect(msg.reply).not.to.have.been.calledOnceWith(
        'protip: napisz `@nazwa ++`, żeby komuś podziękować!',
      );
    }),
  );
});
