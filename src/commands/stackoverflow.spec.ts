import { expect } from 'chai';
import * as Discord from 'discord.js';
import nock from 'nock';

import { getMessageMock } from '../../test/mocks';

import stackoverflow from './stackoverflow';

describe('stackoverflow', () => {
  const mockItem = {
    link: 'Jak pisać testy',
    title: 'https://stackoverflow.com/questions/0/how-to-write-tests',
  } as const;

  const mockLinksEmbed = () =>
    new Discord.EmbedBuilder()
      .setAuthor({
        name: 'Stack Overflow',
        iconURL:
          'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Stack_Overflow_icon.svg/768px-Stack_Overflow_icon.svg.png',
        url: 'https://stackoverflow.com/',
      })
      .setTitle('1 najlepsza odpowiedź:')
      .setColor('#f4811e')
      .addFields([{ name: mockItem.title, value: mockItem.link }]);

  it('should show error message when nothing found on stackoverflow', async () => {
    nock('https://api.stackexchange.com')
      .get(
        '/2.3/search/advanced?pagesize=5&order=desc&sort=activity&q=jak%20pisac%20testy&site=stackoverflow',
      )
      .reply(200, { items: [] });

    const msg = getMessageMock('msg', {});

    await stackoverflow.execute(msg as unknown as Discord.Message, ['jak', 'pisac', 'testy']);

    return expect(msg.channel.send).to.have.been.calledOnce.and.calledWithMatch(
      'Niestety nic nie znalazłem',
    );
  });

  it('should show links when found on stackoverflow', async () => {
    nock('https://api.stackexchange.com')
      .get(
        '/2.3/search/advanced?pagesize=5&order=desc&sort=activity&q=jak%20pisac%20testy&site=stackoverflow',
      )
      .reply(200, {
        items: [mockItem],
      });

    const msg = getMessageMock('msg', {});

    await stackoverflow.execute(msg as unknown as Discord.Message, ['jak', 'pisac', 'testy']);

    return expect(
      (
        msg.channel.send.args[0][0] as { readonly embeds: readonly Discord.EmbedBuilder[] }
      ).embeds.map((e) => e.data)[0],
    ).to.eql(mockLinksEmbed().data);
  });
});
