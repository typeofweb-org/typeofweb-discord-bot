import { expect } from 'chai';
import * as Discord from 'discord.js';

import { getMessageMock } from '../../test/mocks';

import skierowanie from './skierowanie';

describe('skierowanie', () => {
  const mockAuthor = { username: 'user', avatarURL: () => 'url' };

  const mockLinksEmbed = (links: readonly string[]) =>
    new Discord.MessageEmbed().addField(
      'Z powyższym skierowaniem należy udać się na poniższe strony internetowe:',
      links.join('\n'),
    );

  it('it should send two messages', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute(msg as unknown as Discord.Message, ['user']);

    return expect(msg.channel.send).to.have.been.calledTwice;
  });

  it('it should send the links for the passed category', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute(msg as unknown as Discord.Message, ['user', 'react']);

    const linksMessageMock = [
      'https://reactjs.org/docs',
      'https://developer.mozilla.org/en-US/docs/Learn',
      'https://typeofweb.com',
      'https://frontlive.pl',
    ];

    return expect(msg.channel.send).to.have.been.calledWithExactly(
      mockLinksEmbed(linksMessageMock),
    );
  });
});
