import { EmbedBuilder } from 'discord.js';

import type { Command } from '../types';

const links = [
  'https://justjoin.it/',
  'https://nofluffjobs.com/',
  'https://bulldogjob.pl/',
  'https://www.pracuj.pl/',
];

const praca: Command = {
  name: 'praca',
  args: 'prohibited',
  description: 'Lista najlepszych portali z ofertami pracy',
  execute(msg) {
    const embed = new EmbedBuilder()
      .setTitle('Najlepsze portale z ofertami pracy')
      .setDescription(links.map((link, i) => `${i + 1}. ${link}`).join('\n'))
      .setColor('#5ab783')
      .setFooter({
        text: 'Type of Web, Discord, Polska',
        iconURL:
          'https://cdn.discordapp.com/avatars/574682557988470825/8071299007c2d575c0912255baa19509.png?size=64',
      })
      .setTimestamp();

    return msg.channel.send({ embeds: [embed] });
  },
};

export default praca;
