import Discord from 'discord.js';
import { Command } from '../types';
import fetch from 'node-fetch';
import { capitalizeFirst } from "../utils";

const yesno: Command = {
	name: 'yesno',
	description: 'Podejmie decyzję za ciebie',
	args: true,
	async execute(msg: Discord.Message, args: string[]) {
		const URL = args[0] ? `https://yesno.wtf/api?force=${args[0]}` : 'https://yesno.wtf/api';

		const res = await fetch(URL);
		const { answer, image } = (await res.json()) as ApiResponse;

		const answerEmbed = new Discord.MessageEmbed()
			.setTitle(capitalizeFirst(answer))
			.setImage(image);

		if(answer === 'yes') answerEmbed.setColor('#5ab783');
		if(answer === 'no') answerEmbed.setColor('#e91e63');

		return msg.channel.send(answerEmbed);
	},
};

export default yesno;

interface ApiResponse {
	answer: string;
	forced: boolean;
	image: string;
}