import { expect } from 'chai';
import * as Discord from 'discord.js';

import { getMessageMock } from '../../test/mocks';

import skierowanie from './skierowanie';

describe('skierowanie', () => {
  const mockAuthor = { username: 'user', avatarURL: () => 'http://url.com' };

  it('it should send two messages', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute(msg as unknown as Discord.Message, ['user']);

    return expect(msg.channel.send).to.have.been.calledOnce;
  });

  it('it should send the links for the passed category', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute(msg as unknown as Discord.Message, ['user', 'react']);

    // @ts-ignore
    const linksMessageMock = [
      'https://reactjs.org/docs',
      'https://developer.mozilla.org/en-US/docs/Learn',
      'https://typeofweb.com',
      'https://frontlive.pl',
    ];

    const argsEmbedsData = (
      msg.channel.send.args[0][0] as { readonly embeds: readonly Discord.EmbedBuilder[] }
    ).embeds
      .flatMap((e) => e.data.fields)
      .map((e) => e?.value);

    expect(argsEmbedsData).to.include(
      `Z powyższym skierowaniem należy udać się na poniższe strony internetowe:`,
    );
    expect(
      linksMessageMock.every((link) => argsEmbedsData.some((e) => e?.includes(link))),
    ).to.equal(true);
  });
});
