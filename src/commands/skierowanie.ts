import Discord from 'discord.js';
import { Command } from '../types';

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
  { url: 'https://ishadeed.com/articles/', category: 'accessibility' },
  { url: 'https://frontlive.pl/kategorie/dostepnosc', category: 'accessibility' },
  { url: 'https://www.a11yproject.com/', category: 'accessibility' },
  { url: 'https://blog.comandeer.pl/a11y/', category: 'accessibility' },
  { url: 'https://www.smashingmagazine.com/guides/accessibility/', category: 'accessibility' },
  { url: 'https://www.scottohara.me/writing/', category: 'accessibility' },
  { url: 'https://webaim.org/', category: 'accessibility' },
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
    const skierowanieEmbed = new Discord.RichEmbed()
      .setColor('#5ab783')
      .setAuthor(
        `Type of Web oraz ${msg.author.username}`,
        msg.author.avatarURL,
        'https://typeofweb.com'
      )
      .setTitle('Skierowanie na naukę podstaw')
      .setThumbnail('https://typeofweb.com/wp-content/uploads/2020/04/logo_kwadrat11.png')
      .addField(
        'Działając na podstawie mojej intuicji oraz wiadomości wysłanych przez osobę skierowaną, kieruję użytkownika/użytkowniczkę',
        args[0]
      )
      .addField(
        `na naukę podstaw wybranej przez siebie technologii, w celu lepszego zrozumienia fundamentów jej działania oraz poznania informacji niezbędnych do rozszerzania swojej wiedzy o bardziej zaawansowane zagadnienia`,
        `Obecnie posiadana wiedza przez wyżej wymienioną osobę jest zbyt wąska, by mogła ona dalej kontynuować swoją naukę w trudniejszych zagadnieniach w sposób efektywny i zrozumiały`
      )
      .setTimestamp()
      .setFooter(
        'Type of Web, Discord, Polska',
        'https://cdn.discordapp.com/avatars/574682557988470825/6b0fab28093e6020f497fda41bdd3219.png?size=64'
      );

    const categoryFilter = args[1]?.toLowerCase();
    const linksFiltered = categoryFilter
      ? links.filter(({ category }) => !category || category === categoryFilter)
      : links;

    const linksMessage = 'Z powyższym skierowaniem należy udać się na poniższe strony internetowe:';

    await msg.channel.send(skierowanieEmbed);
    return msg.channel.send([linksMessage, ...linksFiltered.map((link) => link.url)]);
  },
};

export default skierowanie;
