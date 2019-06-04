import Discord from 'discord.js';
import { Command } from '../types';

const markdownCodes = [
  '*tekst*',
  '_tekst_',
  '__*tekst*__',
  '**tekst**',
  '__**tekst**__',
  '***tekst***',
  '__***tekst***__',
  '__tekst__',
  '~~tekst~~',
];

const sourceExample = ['\\`\\`\\`js (html, css, json, cp, md, py, xml etc.)', 'kod', '\\`\\`\\`'];

function codesToInstruction(codes: string[]) {
  const maxLength = Math.max(...codes.map(x => x.length));

  return codes.map(code => {
    return '`' + code.padEnd(maxLength) + ' 👉` ' + code;
  });
}

const formattedMarkdownManual = [...codesToInstruction(markdownCodes), '', ...sourceExample].join(
  '\n'
);

const markdown: Command = {
  name: 'markdown',
  description: 'Wyświetla przykłady formatowania tekstu w Markdown.',
  args: false,
  execute(msg: Discord.Message) {
    return msg.channel.send(formattedMarkdownManual);
  },
};

export default markdown;
