import Discord from 'discord.js';
import { Command } from '../types';

const links = [
  { url: 'https://kursjs.pl', category: 'js' },
  { url: 'https://javascript.info', category: 'js' },
  { url: 'https://reactjs.org/docs', category: 'react' },
  { url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript', category: 'js' },
  { url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  { url: 'https://typeofweb.com' },
  { url: 'https://frontlive.pl' },
];

const skierowanie: Command = {
  name: 'skierowanie',
  description: 'Skierowanie na naukę podstaw (+ dobre materiały do nauki)',
  args: true,
  cooldown: 10,
  async execute(msg, args) {
    // Filter out the empty args (whitespaces, etc)
    args = args.filter((val) => val);

    const skierowanieEmbed = new Discord.RichEmbed()
      .setColor('#5ab783')
      .setAuthor(
        `Type of Web oraz ${msg.author.username}`,
        msg.author.avatarURL,
        'https://typeofweb.com'
      )
      .setTitle('Skierowanie na naukę podstaw \uD83D\uDE91')
      .setThumbnail('https://typeofweb.com/wp-content/uploads/2020/04/logo_kwadrat11.png')
      .addField(
        'Działając na podstawie mojej intuicji oraz wiadomości wysłanych przez osobę skierowaną, kieruję użytkownika/użytkowniczkę',
        `${args[0]},`
      )
      .addField(
        `na naukę podstaw wybranej przez siebie technologii,`,
        `w celu lepszego zrozumienia fundamentów jej działania oraz poznania informacji niezbędnych do rozszerzania swojej wiedzy o bardziej zaawansowane zagadnienia`
      )
      .setTimestamp()
      .setFooter(
        'Type of Web, Discord, Polska',
        'https://cdn.discordapp.com/avatars/574682557988470825/6b0fab28093e6020f497fda41bdd3219.png?size=64'
      );

    const categoryFilter = args[1]?.toLowerCase();
    const linksFiltered = categoryFilter
      ? links.filter(({ category }) => !category || category === categoryFilter)
      : links.filter(({ category }) => !category);

    const linksMessage = 'Z powyższym skierowaniem należy udać się na poniższe strony internetowe:';

    const linksEmbed = new Discord.RichEmbed().addField(
      linksMessage,
      linksFiltered.map((l) => l.url).join('\n')
    );

    await msg.channel.send(skierowanieEmbed);
    return msg.channel.send(linksEmbed);
  },
};

export default skierowanie;
