# Type of Web Discord Bot

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)

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

Thanks goes to these wonderful people:

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/Deeadline"><img src="https://avatars3.githubusercontent.com/u/26546280?v=4" width="100px;" alt=""/><br /><sub><b>Deeadline</b></sub></a></td>
    <td align="center"><a href="https://github.com/AndrewWelc"><img src="https://avatars.githubusercontent.com/u/78659791?s=460&u=c7f264564e80b125382a533d6d7eb5a28910cf4e&v=4" width="100px;" alt=""/><br /><sub><b>Andrew Welc</b></sub></a></td>
        <td align="center"><a href="https://github.com/Razi91"><img src="https://avatars0.githubusercontent.com/u/5995454?v=4" width="100px;" alt=""/><br /><sub><b>jkonieczny</b></sub></a></td>
    <td align="center"><a href="https://github.com/porithe"><img src="https://avatars.githubusercontent.com/u/33372728?s=460&u=ec4abd3d3b77d26aade94e105211aecc3afb5901&v=4" width="100px;" alt=""/><br /><sub><b>Porithe</b></sub></a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
