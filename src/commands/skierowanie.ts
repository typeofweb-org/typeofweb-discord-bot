import Discord from 'discord.js';

import type { Command } from '../types';

const links = [
  { url: 'https://kursjs.pl', category: 'js' },
  { url: 'https://javascript.info', category: 'js' },
  { url: 'https://javascript30.com/', category: 'js' },
  { url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript', category: 'js' },
  { url: 'https://reactjs.org/docs', category: 'react' },
  { url: 'https://tutorials.comandeer.pl/html5-blog.html', category: 'html' },
  { url: 'https://blog.comandeer.pl/o-naglowkach-slow-kilka.html', category: 'html' },
  { url: 'https://blog.comandeer.pl/o-ikonkach-slow-kilka.html', category: 'html' },
  { url: 'https://blog.comandeer.pl/o-semantyce-slow-kilka.html', category: 'html' },
  { url: 'https://www.smashingmagazine.com/guides/css-layout/', category: 'css' },
  { url: 'https://css-tricks.com/', category: 'css' },
  { url: 'https://en.bem.info/methodology/quick-start/', category: 'css' },
  { url: 'https://blog.comandeer.pl/bem-jako-architektura.html', category: 'css' },
  { url: 'https://ishadeed.com/articles/', category: 'a11y' },
  { url: 'https://frontlive.pl/kategorie/dostepnosc', category: 'a11y' },
  { url: 'https://www.a11yproject.com/', category: 'a11y' },
  { url: 'https://blog.comandeer.pl/a11y/', category: 'a11y' },
  { url: 'https://www.smashingmagazine.com/guides/accessibility/', category: 'a11y' },
  { url: 'https://www.scottohara.me/writing/', category: 'a11y' },
  { url: 'https://webaim.org/', category: 'a11y' },
  { url: 'https://typescriptnapowaznie.pl/', category: 'ts' },
  { url: 'https://www.typescriptlang.org/docs/', category: 'ts' },
  { url: 'https://github.com/typescript-cheatsheets', category: 'ts' },
  { url: 'https://developer.mozilla.org/en-US/docs/Learn' },
  { url: 'https://typeofweb.com' },
  { url: 'https://frontlive.pl' },
];

const skierowanie: Command = {
  name: 'skierowanie',
  description: 'Skierowanie na naukę podstaw (+ dobre materiały do nauki). Składnia: `!skierowanie <użytkownik> <technologia>`',
  args: 'required',
  cooldown: 10,
  async execute(msg, av) {
    // Filter out the empty args (whitespaces, etc)
    const args = av.filter((val) => val);

    const skierowanieEmbed = new Discord.MessageEmbed()
      .setColor('#5ab783')
      .setAuthor(
        `Type of Web oraz ${msg.author.username}`,
        msg.author.avatarURL() ?? undefined,
        'https://typeofweb.com',
      )
      .setTitle('Skierowanie na naukę podstaw 🚑')
      .setThumbnail('https://typeofweb.com/wp-content/uploads/2020/04/logo_kwadrat11.png')
      .addField(
        'Działając na podstawie mojej intuicji oraz wiadomości wysłanych przez osobę skierowaną, kieruję użytkownika/użytkowniczkę',
        args[0],
      )
      .addField(
        `na naukę podstaw wybranej przez siebie technologii,`,
        `w celu lepszego zrozumienia fundamentów jej działania oraz poznania informacji niezbędnych do rozszerzania swojej wiedzy o bardziej zaawansowane zagadnienia`,
      )
      .setTimestamp()
      .setFooter(
        'Type of Web, Discord, Polska',
        'https://cdn.discordapp.com/avatars/574682557988470825/6b0fab28093e6020f497fda41bdd3219.png?size=64',
      );

    const categoryFilter = args[1]?.toLowerCase();
    const linksFiltered = categoryFilter
      ? links.filter(({ category }) => !category || category === categoryFilter)
      : links.filter(({ category }) => !category);

    const linksMessage = 'Z powyższym skierowaniem należy udać się na poniższe strony internetowe:';

    const linksEmbed = new Discord.MessageEmbed().addField(
      linksMessage,
      linksFiltered.map((l) => l.url).join('\n'),
    );

    await msg.channel.send(skierowanieEmbed);
    return msg.channel.send(linksEmbed);
  },
};

export default skierowanie;
