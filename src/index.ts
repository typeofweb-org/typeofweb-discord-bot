import Discord from "discord.js";
import DiscordRSS from "discord.rss";

const client = new Discord.Client();
const drss = new DiscordRSS.Client({ database: { uri: "./sources" } }); // File-based sources instead of Mongo

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
  if (msg.content === "ping") {
    void msg.reply("pong");
  }
});

async function init() {
  await client.login("token");
  await drss.login(client);
}

void init();
