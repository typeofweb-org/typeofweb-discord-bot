# Type of Web Discord Bot

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-8-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

## Getting Started

#### Prepare project

Run `npm install` to install all dependencies

_[Based on windows system]_

If an error with Python occurs open the system console with admin privileges and type:

```
npm --add-python-to-path='true' --debug install --global windows-build-tools
```

If that was the case run again `npm install` to install dependencies properly.

#### Setup environmental variables

Create `.env.dev` file based on `.env.dev-sample` (just copy and rename it). Fill the API keys with `0` if you don't have them.

#### Connect to development bot

Create a new discord server where you will be testing your bot.

[Follow this tutorial to create a new bot.](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token) Then add it to your server.

Use the bot token in `.env.dev` file.

#### Run the server

Use `npm run dev` to start the server.

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
    <td align="center"><a href="https://typeofweb.com"><img src="https://avatars0.githubusercontent.com/u/1338731?v=4" width="100px;" alt=""/><br /><sub><b>Michał Miszczyszyn</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=mmiszy" title="Code">💻</a> <a href="#ideas-mmiszy" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-mmiszy" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/mmiszy/typeofweb-discord-bot/pulls?q=is%3Apr+reviewed-by%3Ammiszy" title="Reviewed Pull Requests">👀</a></td>
    <td align="center"><a href="https://github.com/Deeadline"><img src="https://avatars3.githubusercontent.com/u/26546280?v=4" width="100px;" alt=""/><br /><sub><b>Deeadline</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=Deeadline" title="Code">💻</a> <a href="#ideas-Deeadline" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="http://trzasq.pl"><img src="https://avatars2.githubusercontent.com/u/20127089?v=4" width="100px;" alt=""/><br /><sub><b>przytrzask</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=przytrzask" title="Code">💻</a> <a href="#ideas-przytrzask" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/nanoDW"><img src="https://avatars2.githubusercontent.com/u/37413661?v=4" width="100px;" alt=""/><br /><sub><b>nanoDW</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=nanoDW" title="Code">💻</a> <a href="#ideas-nanoDW" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/Secrus"><img src="https://avatars2.githubusercontent.com/u/26322915?v=4" width="100px;" alt=""/><br /><sub><b>Secrus</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=Secrus" title="Code">💻</a> <a href="#ideas-Secrus" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/larto42"><img src="https://avatars3.githubusercontent.com/u/16961273?v=4" width="100px;" alt=""/><br /><sub><b>larto42</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=larto42" title="Documentation">📖</a></td>
    <td align="center"><a href="https://github.com/Razi91"><img src="https://avatars0.githubusercontent.com/u/5995454?v=4" width="100px;" alt=""/><br /><sub><b>jkonieczny</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=Razi91" title="Code">💻</a> <a href="#ideas-Razi91" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=Razi91" title="Tests">⚠️</a></td>
  </tr>
  <tr>
    <td align="center"><a href="https://github.com/D0man"><img src="https://avatars2.githubusercontent.com/u/22179216?v=4" width="100px;" alt=""/><br /><sub><b>Kuba Domański</b></sub></a><br /><a href="https://github.com/mmiszy/typeofweb-discord-bot/commits?author=D0man" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
