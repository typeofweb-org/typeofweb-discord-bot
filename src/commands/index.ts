import Discord from "discord.js";

export function handleCommand(msg: Discord.Message) {
  switch (msg.content) {
    case "!server":
      return msg.channel.send(`Nazwa tego serwera to: ${msg.guild.name}`);
    case "!link":
      return msg.channel.send(
        `Link do zapraszania: https://discord.typeofweb.com/`
      );
  }
  return undefined;
}
