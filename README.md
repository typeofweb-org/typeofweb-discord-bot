# Type of Web Discord Bot

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-16-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Getting Started

#### Prepare project

Run `yarn` to install all dependencies

_[Based on windows system]_

If an error with Python occurs open the system console with admin privileges and type:

```
yarn --add-python-to-path='true' --debug install --global windows-build-tools
```

If that was the case run again `yarn` to install dependencies properly.

#### Setup environmental variables

Create `.env.dev` file based on `.env.dev-sample` (just copy and rename it). Fill the API keys with `0` if you don't have them.

#### Connect to development bot

Create a new discord server where you will be testing your bot.

[Follow this tutorial to create a new bot.](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) Then add it to your server.

Use the bot token in `.env.dev` file.

#### Run the server

Use `yarn dev` to start the server.

You should get this in your console, which suggests that everything went ok.

```
Server running!
Logged in as [Bot Name]!
```

_You will probably get some errors like "Failed to connect to database" as well. Don't worry about them if you don't need the database._

When you log into the discord server you should see that your Bot is active.
You can use one of the existing commands like `!co` to try it out :)

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://typeofweb.com"><img src="https://avatars0.githubusercontent.com/u/1338731?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Michał Miszczyszyn</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=mmiszy" title="Code">💻</a> <a href="#ideas-mmiszy" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-mmiszy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/pulls?q=is%3Apr+reviewed-by%3Ammiszy" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/Deeadline"><img src="https://avatars3.githubusercontent.com/u/26546280?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Deeadline</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Deeadline" title="Code">💻</a> <a href="#ideas-Deeadline" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://trzasq.pl"><img src="https://avatars2.githubusercontent.com/u/20127089?v=4?s=100" width="100px;" alt=""/><br /><sub><b>przytrzask</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=przytrzask" title="Code">💻</a> <a href="#ideas-przytrzask" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/nanoDW"><img src="https://avatars2.githubusercontent.com/u/37413661?v=4?s=100" width="100px;" alt=""/><br /><sub><b>nanoDW</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=nanoDW" title="Code">💻</a> <a href="#ideas-nanoDW" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Secrus"><img src="https://avatars2.githubusercontent.com/u/26322915?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Secrus</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Secrus" title="Code">💻</a> <a href="#ideas-Secrus" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Secrus" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/larto42"><img src="https://avatars3.githubusercontent.com/u/16961273?v=4?s=100" width="100px;" alt=""/><br /><sub><b>larto42</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=larto42" title="Documentation">📖</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/Razi91"><img src="https://avatars0.githubusercontent.com/u/5995454?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jkonieczny</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Razi91" title="Code">💻</a> <a href="#ideas-Razi91" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Razi91" title="Tests">⚠️</a> <a href="#security-Razi91" title="Security">🛡️</a></td>
    <td align="center"><a href="https://github.com/D0man"><img src="https://avatars2.githubusercontent.com/u/22179216?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Kuba Domański</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=D0man" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Survikrowa"><img src="https://avatars2.githubusercontent.com/u/35381167?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Survikrowa</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Survikrowa" title="Code">💻</a> <a href="#ideas-Survikrowa" title="Ideas, Planning, & Feedback">🤔</a></td>
  </tr>
  <tr>
    <td align="center"><a href="http://siekierski.ml"><img src="https://avatars0.githubusercontent.com/u/24841038?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Adam Siekierski</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=AdamSiekierski" title="Code">💻</a> <a href="#ideas-AdamSiekierski" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://frontlive.pl"><img src="https://avatars1.githubusercontent.com/u/46969484?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Olaf Sulich</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=olafsulich" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/Eghizio"><img src="https://avatars.githubusercontent.com/u/32049761?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jakub Wąsik</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Eghizio" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kbkk"><img src="https://avatars.githubusercontent.com/u/6276426?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Jakub Kisielewski</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=kbkk" title="Code">💻</a></td>
    <td align="center"><a href="https://github.com/drillprop"><img src="https://avatars.githubusercontent.com/u/51168865?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Bartosz Dryl</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=drillprop" title="Code">💻</a></td>
    <td align="center"><a href="https://jundymek.com/"><img src="https://avatars.githubusercontent.com/u/24244872?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Łukasz Dymek</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=jundymek" title="Code">💻</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/kamiloox"><img src="https://avatars.githubusercontent.com/u/45523480?v=4?s=100" width="100px;" alt=""/><br /><sub><b>kamiloox</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=kamiloox" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
