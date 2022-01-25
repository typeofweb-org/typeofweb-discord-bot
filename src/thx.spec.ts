import { thx } from './thx';
import { expect } from 'chai';
import * as Discord from 'discord.js';
import { getMessageMock } from '../test/mocks';

describe('thx', () => {
  let id = 0;
  const msgReply =
    'protip: napisz `@nazwa ++`, żeby komuś podziękować! Możesz podziękować kilku osobom w jednej wiadomości!';

  it('it should ignore random messages', async () => {
    const msg = getMessageMock('msg', { content: 'msg', channel: { id: ++id } });
    msg.reply.resolves();

    await thx(msg as unknown as Discord.Message);

    expect(msg.reply).not.to.have.been.calledOnceWith(msgReply);
  });

  [
    'thx',
    'thank',
    'thanks',
    'dzieki',
    'dzięki',
    'dziekuje',
    'dziekuję',
    'dziękuje',
    'dziękuję',
  ].forEach((text) =>
    it(`it should respond to ${text}`, async () => {
      const msg = getMessageMock('msg', { content: text, channel: { id: ++id } });
      msg.reply.resolves();

      await thx(msg as unknown as Discord.Message);

      expect(msg.reply).to.have.been.calledOnceWith(msgReply);
    }),
  );

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

      expect(msg.reply).not.to.have.been.calledOnceWith(msgReply);
    }),
  );
});
