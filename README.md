# Type of Web Discord Bot

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-20-orange.svg?style=flat-square)](#contributors-)

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
  <tbody>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://typeofweb.com"><img src="https://avatars0.githubusercontent.com/u/1338731?v=4?s=100" width="100px;" alt="Michał Miszczyszyn"/><br /><sub><b>Michał Miszczyszyn</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=mmiszy" title="Code">💻</a> <a href="#ideas-mmiszy" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-mmiszy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/pulls?q=is%3Apr+reviewed-by%3Ammiszy" title="Reviewed Pull Requests">👀</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/Deeadline"><img src="https://avatars3.githubusercontent.com/u/26546280?v=4?s=100" width="100px;" alt="Deeadline"/><br /><sub><b>Deeadline</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Deeadline" title="Code">💻</a> <a href="#ideas-Deeadline" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="33.33%"><a href="http://trzasq.pl"><img src="https://avatars2.githubusercontent.com/u/20127089?v=4?s=100" width="100px;" alt="przytrzask"/><br /><sub><b>przytrzask</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=przytrzask" title="Code">💻</a> <a href="#ideas-przytrzask" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/nanoDW"><img src="https://avatars2.githubusercontent.com/u/37413661?v=4?s=100" width="100px;" alt="nanoDW"/><br /><sub><b>nanoDW</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=nanoDW" title="Code">💻</a> <a href="#ideas-nanoDW" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/Secrus"><img src="https://avatars2.githubusercontent.com/u/26322915?v=4?s=100" width="100px;" alt="Secrus"/><br /><sub><b>Secrus</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Secrus" title="Code">💻</a> <a href="#ideas-Secrus" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Secrus" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/larto42"><img src="https://avatars3.githubusercontent.com/u/16961273?v=4?s=100" width="100px;" alt="larto42"/><br /><sub><b>larto42</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=larto42" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/Razi91"><img src="https://avatars0.githubusercontent.com/u/5995454?v=4?s=100" width="100px;" alt="jkonieczny"/><br /><sub><b>jkonieczny</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Razi91" title="Code">💻</a> <a href="#ideas-Razi91" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Razi91" title="Tests">⚠️</a> <a href="#security-Razi91" title="Security">🛡️</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/D0man"><img src="https://avatars2.githubusercontent.com/u/22179216?v=4?s=100" width="100px;" alt="Kuba Domański"/><br /><sub><b>Kuba Domański</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=D0man" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/Survikrowa"><img src="https://avatars2.githubusercontent.com/u/35381167?v=4?s=100" width="100px;" alt="Survikrowa"/><br /><sub><b>Survikrowa</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Survikrowa" title="Code">💻</a> <a href="#ideas-Survikrowa" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="http://siekierski.ml"><img src="https://avatars0.githubusercontent.com/u/24841038?v=4?s=100" width="100px;" alt="Adam Siekierski"/><br /><sub><b>Adam Siekierski</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=AdamSiekierski" title="Code">💻</a> <a href="#ideas-AdamSiekierski" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="33.33%"><a href="http://frontlive.pl"><img src="https://avatars1.githubusercontent.com/u/46969484?v=4?s=100" width="100px;" alt="Olaf Sulich"/><br /><sub><b>Olaf Sulich</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=olafsulich" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/Eghizio"><img src="https://avatars.githubusercontent.com/u/32049761?v=4?s=100" width="100px;" alt="Jakub Wąsik"/><br /><sub><b>Jakub Wąsik</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Eghizio" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/kbkk"><img src="https://avatars.githubusercontent.com/u/6276426?v=4?s=100" width="100px;" alt="Jakub Kisielewski"/><br /><sub><b>Jakub Kisielewski</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=kbkk" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/drillprop"><img src="https://avatars.githubusercontent.com/u/51168865?v=4?s=100" width="100px;" alt="Bartosz Dryl"/><br /><sub><b>Bartosz Dryl</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=drillprop" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://jundymek.com/"><img src="https://avatars.githubusercontent.com/u/24244872?v=4?s=100" width="100px;" alt="Łukasz Dymek"/><br /><sub><b>Łukasz Dymek</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=jundymek" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/kamiloox"><img src="https://avatars.githubusercontent.com/u/45523480?v=4?s=100" width="100px;" alt="kamiloox"/><br /><sub><b>kamiloox</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=kamiloox" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="http://bartek532.github.io/portfolio"><img src="https://avatars.githubusercontent.com/u/57185551?v=4?s=100" width="100px;" alt="Bartosz Zagrodzki"/><br /><sub><b>Bartosz Zagrodzki</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Bartek532" title="Code">💻</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=Bartek532" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://michalczukm.xyz"><img src="https://avatars.githubusercontent.com/u/6861120?v=4?s=100" width="100px;" alt="Michał Michalczuk"/><br /><sub><b>Michał Michalczuk</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=michalczukm" title="Code">💻</a> <a href="https://github.com/typeofweb/typeofweb-discord-bot/issues?q=author%3Amichalczukm" title="Bug reports">🐛</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="33.33%"><a href="https://projectcode.pl"><img src="https://avatars.githubusercontent.com/u/27779154?v=4?s=100" width="100px;" alt="Adrian Polak"/><br /><sub><b>Adrian Polak</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=AdiPol1359" title="Code">💻</a></td>
      <td align="center" valign="top" width="33.33%"><a href="https://github.com/KrallXZ"><img src="https://avatars.githubusercontent.com/u/6277709?v=4?s=100" width="100px;" alt="Karol Syta"/><br /><sub><b>Karol Syta</b></sub></a><br /><a href="https://github.com/typeofweb/typeofweb-discord-bot/commits?author=KrallXZ" title="Code">💻</a> <a href="#ideas-KrallXZ" title="Ideas, Planning, & Feedback">🤔</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
