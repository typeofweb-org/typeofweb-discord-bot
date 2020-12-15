/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import skierowanie from './skierowanie';
import { getMessageMock } from '../../test/mocks';
import { expect } from 'chai';
import * as Discord from 'discord.js';

describe('skierowanie', () => {
  const mockAuthor = { username: 'user', avatarURL: 'url' };

  it('it should send a message', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute((msg as unknown) as Discord.Message, ['user']);

    await expect(msg.channel.send).to.have.been.calledTwice;
  });

  it('it should send the links for the passed category', async () => {
    const msg = getMessageMock('msg', { author: mockAuthor });

    await skierowanie.execute((msg as unknown) as Discord.Message, ['user', 'react']);

    const linksMessageMock = [
      'Z powyższym skierowaniem należy udać się na poniższe strony internetowe:',
      'https://reactjs.org/docs',
      'https://developer.mozilla.org/en-US/docs/Learn',
      'https://typeofweb.com',
      'https://frontlive.pl',
    ];

    await expect(msg.channel.send).to.have.been.calledWithExactly(linksMessageMock);
  });
});
