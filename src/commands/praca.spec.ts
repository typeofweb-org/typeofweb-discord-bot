import { expect } from 'chai';
import type Discord from 'discord.js';

import { getMessageMock } from '../../test/mocks';

import praca from './praca';

describe('praca', () => {
  it('should send links to websites', async () => {
    const mockLinks = [
      'https://justjoin.it/',
      'https://nofluffjobs.com/',
      'https://bulldogjob.pl/',
      'https://www.pracuj.pl/',
    ];
    const msg = getMessageMock('msg', {});

    await praca.execute(msg as unknown as Discord.Message, []);

    const embedData = (
      msg.channel.send.args[0][0] as { readonly embeds: readonly Discord.EmbedBuilder[] }
    ).embeds[0].data;

    expect(embedData.title).to.equal('Najlepsze portale z ofertami pracy');
    expect(mockLinks.every((link) => embedData.description?.includes(link))).to.equal(true);
  });
});
