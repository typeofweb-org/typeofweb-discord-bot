import Discord from 'discord.js';
import { Command } from '../types';

const markdown: Command = {
  name: 'markdown',
  description: 'Wyświetla przykłady formatowania tekstu w Markdown.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(
      [
        '*tekst* || _tekst_  :point_right:  *tekst*',
        '__*tekst*__  :point_right:  __*tekst*__',
        '**tekst**  :point_right:  **tekst**',
        '__**tekst**__  :point_right:  __**tekst**__',
        '***tekst***  :point_right:  ***tekst***',
        '__***tekst***__  :point_right: __***tekst***__',
        '__tekst__  :point_right:  __tekst__',
        '~~tekst~~  :point_right:  ~~tekst~~',
        '```js (html, css, json, cp, md, py, xml etc.)',
        'kod',
        '```',
      ].join('\n')
    );
  },
};

export default markdown;
