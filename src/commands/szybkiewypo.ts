import nodeHtmlToImage from 'node-html-to-image';
import { Command } from '../types';

const szybkiewypo: Command = {
  name: 'szybkiewypo',
  description: 'Szybkie wypo',
  args: false,
  cooldown: 60,
  async execute(msg) {
    const date = new Date().toISOString().slice(0, 10);
    const username = msg.member.user.username;
    const wypo = `Wypowiadam umowę o pracę zawartą pomiędzy pracodawcą a ${username} z zachowaniem okresu wypowiedzenia, który wynosi 0 dni.`;
    const tumama = `Tu mama ${username}, potwierdzam`;
    const head = `
        <head>
            <style> 
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { padding: 10px 30px; height: 450px; }
            h1 { text-align: center; margin-top: 60px }
            h4 { text-align: left; margin-top: 20px }
            h5 { text-align: right; margin-top: 30px }
            .wypo { text-align: center; width: 450px; margin: 40px auto 0 auto; }
            .powaznie { text-align: right; margin-top: 40px; }
            </style>
         </head>
        `;
    const body = `
        <body>
          <h5>Hello dev {{date}}</h5>
          <h4>{{username}}</h4>
          <h1>WYPOWIEDZENIE UMOWY O PRACE</h1>
          <p class="wypo">{{wypo}}</p>
          <div class="powaznie"><p>Z poważaniem,</p><p>{{username}}</p></div>
          <div><p>Potwierdzam otrzymanie wypowiedzenia,</p><p>{{tumama}}</p></div>
        </body>
        `;
    const html = `<html>${head}${body}</html>`;
    const img = await nodeHtmlToImage({
      puppeteerArgs: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      },
      html: html,
      content: { username, date, wypo, tumama },
    });
    return msg.channel.send({
      files: [img],
    });
  },
};

export default szybkiewypo;
