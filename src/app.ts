import Discord from "discord.js";
import DiscordRSS from "discord.rss";

import { handleCommand } from "./commands";
import { getConfig } from "./config";

const PREFIX = "!";
const client = new Discord.Client();
const drss = new DiscordRSS.Client({
  database: {
    uri: getConfig("MONGO_URL"),
    connection: {
      useNewUrlParser: true
    }
  }
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (!msg.content.startsWith(PREFIX) || msg.author.bot) {
    return;
  }
  handleCommand(msg);
});

async function init() {
  await client.login(getConfig("DISCORD_BOT_TOKEN"));
  drss._defineBot(client);
}

void init();
