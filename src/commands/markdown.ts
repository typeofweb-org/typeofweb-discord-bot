import Discord from 'discord.js';
import { Command } from '../types';

const markdown: Command = {
    name: 'markdown',
    description: 'Wyświetla przykłady formatowania tekstu w Markdown.',
    args: false,
    execute(msg: Discord.Message) {
        return msg.channel.send([
            '```',
            '*kursywa* lub _kursywa_',
            '__*podkreślona kursywa*__',
            '**pogrubiony**',
            '__**podkreślony pogrubiony**__',
            '***pogrubiona kursywa***',
            '__***podkreślona pogrubiona kursywa***__',
            '__podkreślenie__',
            '~~przekreślenie~~',
            '```',
            '\\```js (html, css, json, cp, md, py, xml etc.)',
            'kod',
            '\\```',
        ].join('\n'));
    },
};

export default markdown;