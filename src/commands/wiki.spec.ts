/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */

import wiki from './wiki';
import { getMessageMock } from '../../test/mocks';
import { expect } from 'chai';
import nock from 'nock';
import * as Discord from 'discord.js';

describe('wiki', () => {
  it('should show error message when nothing found on wikipedia', async () => {
    nock('https://pl.wikipedia.org/w')
      .get(`/api.php?action=opensearch&search=moja%20ulubiona%20piosenka&limit=1&format=json`)
      .reply(200, ['moja ulubiona piosenka', [], [], []]);

    const msg = getMessageMock('msg');

    await wiki.execute(msg as unknown as Discord.Message, ['moja', 'ulubiona', 'piosenka']);

    await expect(msg.channel.send).to.have.been.calledOnce.and.calledWithMatch('Nic nie znalazłam');
  });

  it('should show search result when found on wikipedia', async () => {
    nock('https://pl.wikipedia.org/w')
      .get(`/api.php?action=opensearch&search=moja%20ulubiona%20piosenka&limit=1&format=json`)
      .reply(200, [
        'moja ulubiona piosenka',
        ['Moja ulubiona piosenka'],
        [],
        ['https://pl.wikipedia.org/wiki/Moja_ulubiona_piosenka'],
      ]);

    const msg = getMessageMock('msg');

    await wiki.execute(msg as unknown as Discord.Message, ['moja', 'ulubiona', 'piosenka']);

    await expect(msg.channel.send).to.have.been.calledOnceWith(
      'Pod hasłem: moja ulubiona piosenka\nZnalazłam artykuł: Moja ulubiona piosenka\nDostępny tutaj: https://pl.wikipedia.org/wiki/Moja_ulubiona_piosenka',
    );
  });
});
