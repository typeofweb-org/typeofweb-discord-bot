import Discord from 'discord.js';
import Cache from 'node-cache';

const THX_TIMEOUT_S = 15 * 60;
const thxTimeoutCache = new Cache({ stdTTL: THX_TIMEOUT_S });

export const thx = (msg: Discord.Message) => {
  if (
    !/(thx|thank|dzięki|dziękuję|dzieki|dziekuje)($|(\s+(?!temu|niej|niemu|tobie)+.*))/i.test(
      msg.content,
    )
  ) {
    return;
  }

  if (
    (thxTimeoutCache.get<Date>(msg.channel.id)?.getTime() ?? 0) >
    Date.now() - THX_TIMEOUT_S * 1000
  ) {
    return;
  }

  thxTimeoutCache.set(msg.channel.id, new Date());
  return msg.reply('protip: napisz `@nazwa ++`, żeby komuś podziękować! Możesz podziękować kilku osobom w jednej wiadomości!');
};
