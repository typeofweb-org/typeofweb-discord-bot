import Discord from 'discord.js';
import fetch from 'node-fetch';

import type { Command } from '../types';
import { capitalizeFirst } from '../utils';

const answerToColor = {
  yes: '#5ab783',
  no: '#e91e63',
  maybe: '#eb8921',
} as const;

const yesno: Command = {
  name: 'yesno',
  description: 'Podejmie decyzję za ciebie',
  args: 'optional',
  async execute(msg, [force]) {
    const url = ['yes', 'no', 'maybe'].includes(force)
      ? `https://yesno.wtf/api?force=${force}`
      : 'https://yesno.wtf/api';

    const res = await fetch(url);
    const { answer, image } = (await res.json()) as YesNoApiResponse;

    const answerEmbed = new Discord.EmbedBuilder()
      .setTitle(capitalizeFirst(answer))
      .setImage(image)
      .setColor(answerToColor[answer]);

    return msg.channel.send({ embeds: [answerEmbed] });
  },
};

export default yesno;

interface YesNoApiResponse {
  readonly answer: 'yes' | 'no' | 'maybe';
  readonly forced: boolean;
  readonly image: string;
}
