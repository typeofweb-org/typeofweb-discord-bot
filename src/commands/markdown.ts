import Discord from 'discord.js';
import { Command } from '../types';

const markdown: Command = {
    name: 'markdown',
    description: 'Wyświetla przykłady formatowania tekstu w Markdown.',
    args: false,
    execute(msg: Discord.Message) {
        return msg.channel.send([
            '\*tekst\* || \_tekst\_  :point_right:  *tekst*',
            '\_\_\*tekst\*\_\_  :point_right:  __*tekst*__',
            '\*\*tekst\*\*  :point_right:  **tekst**',
            '\_\_\*\*tekst\*\*\_\_  :point_right:  __**tekst**__',
            '\*\*\*tekst\*\*\*  :point_right:  ***tekst***',
            '\_\_\*\*\*tekst\*\*\*\_\_  :point_right: __***tekst***__',
            '\_\_tekst\_\_  :point_right:  __tekst__',
            '\~\~tekst\~\~  :point_right:  ~~tekst~~',
            '\```js (html, css, json, cp, md, py, xml etc.)',
            'kod',
            '\```'
        ].join('\n'));
    },
};

export default markdown;