import Discord from 'discord.js';
import { Command } from '../types';

const markdown: Command = {
    name: 'markdown',
    description: 'Wyświetla przykłady formatowania tekstu w Markdown.',
    args: false,
    execute(msg: Discord.Message) {
        return msg.channel.send('```*kursywa* or _kursywa_ \n'
            + '__ * podkreślona kursywa * __ \n'
            + '** pogrubiony ** \n'
            + '__ ** podkreślony pogrubiony ** __ \n'
            + '*** pogrubiona kursywa *** \n'
            + '__ *** podkreślona pogrubiona kursywa *** __ \n'
            + '__podkreślenie__ \n'
            + '~~przekreślenie~~``` \n'
            + '\```js (or html, css, json, cp, md, py, xml etc.) \n'
            + 'kod \n'
            + '\``` \n');
    },
};

export default markdown;