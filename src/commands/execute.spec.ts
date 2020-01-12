/* eslint no-implicit-dependencies: "off" */
/* eslint no-magic-numbers: "off" */
/* eslint no-let: "off" */
/* tslint:disable:no-implicit-dependencies no-magic-numbers */

import { expect } from 'chai';
import 'mocha';
import * as execute from './execute';

const Template = (language: string, code: string) => `!execute \`\`\`${language}
${code}
\`\`\``;

const tsCode = 'function foo(a: number) {return a * 2}; foo(2)';

describe('Command: execute', () => {
  it('parses valid message', () => {
    const code = '2 + 2';
    const message = Template('js', code);
    const parseResult = execute.parseMessage(message);
    expect(parseResult.language).to.equal('js');
    expect(parseResult.source.trim()).to.equal(code);
  });

  it('throws on invalid message', () => {
    const messages = [
      '!execute ``js\n5\n```',
      '!execute ```js\n5\n',
      '!execute ```js\n5\n`',
      '!execute ```js5\n`',
      '!execute js\n5',
    ];
    messages.forEach(message => {
      expect(() => execute.parseMessage(message)).to.throw();
    });
  });

  it('sets javascript as default', () => {
    const code = '2 + 2';
    const message = Template('', code);
    const parseResult = execute.parseMessage(message);
    expect(parseResult.language).to.equal('js');
  });

  it('throws when language is not known', async () => {
    await expect(execute.executeCode('2 + 2', 'prolog')).to.eventually.be.rejected;
    // try {
    //   await execute.executeCode('2 + 2', 'prolog');
    //   assert.fail('Expected to throw');
    // } catch(error) {
    //   expect(error).to.not.be.equal(null);
    // }
  });

  it('executes simple program', async () => {
    const executeResult = await execute.executeCode('2 + 2', 'js');
    expect(executeResult.stdout.length).to.equal(0);
    expect(executeResult.result).to.equal(4);
  });

  it('receives json as result', async () => {
    const executeResult = await execute.executeCode(
      'const foo = () => ({foo: "bar"}); foo()',
      'js'
    );
    expect(executeResult.stdout.length).to.equal(0);
    expect(JSON.stringify(executeResult.result)).to.equal('{"foo":"bar"}');
  });

  it('executes typescript', async () => {
    const executeResult = await execute.executeCode(tsCode, 'ts');
    expect(executeResult).to.be.not.an('undefined');
    expect(executeResult.stdout.length).to.equal(0);
    expect(executeResult.result).to.equal(4);
  });

  it('displays objects as jsons', async () => {
    const code = 'console.log({foo: "bar"})';
    const executeResult = await execute.executeCode(code, 'js');
    expect(executeResult.stdout.length).to.be.equal(1);
    expect(executeResult.stdout[0]).to.be.equal('{"foo":"bar"}');
  });

  it('grabs console.log', async () => {
    const executeResult = await execute.executeCode(
      'console.log(1, null, void 0);console.info(3, 4);',
      'js'
    );
    expect(executeResult.stdout.length).to.equal(2);
    expect(executeResult.stdout[0]).to.be.equal('1, null, undefined');
    expect(executeResult.stdout[1]).to.be.equal('[i], 3, 4');
  });

  it('omitts long output log', async () => {
    const iters = 2000;
    const executeResult = await execute.executeCode(
      `for(let i=0; i<${iters}; i++) console.log(1)`,
      'js'
    );
    const stdout = execute.prepareOutput(executeResult);
    expect(stdout.text.length).is.not.greaterThan(execute.MAX_OUTPUT_CHARACTERS);
    expect(executeResult.stdout.length).to.equal(iters);
    expect(stdout.text.split('\n').length).is.not.greaterThan(execute.MAX_OUTPUT_LINES);
  });

  it('result is written', () => {
    const result = {
      stdout: ['hello', 'world'],
      result: void 0,
      time: 10,
    };
    const expected = [
      'Wyjście (2 linie): ```',
      'hello',
      'world',
      '```',
      'Wynik (10 ms): ```json',
      'undefined',
      '```',
    ].join('\n');
    const response = execute.writeResponse(result);
    expect(response).to.be.equal(expected);
  });

  it('"output" is omitted when none', () => {
    const result = {
      stdout: [],
      result: 5,
      time: 10,
    };
    const expected = ['Wynik (10 ms): ```json', '5', '```'].join('\n');
    const response = execute.writeResponse(result);
    expect(response).to.be.equal(expected);
  });

  it('throws when code executes dangerous code', async () => {
    const dangerous = [
      'while(1){}',
      'let fs = require("fs")',
      'let fs = require("child_process")',
      'process.exit(0)',
      'eval("require("fs"))',
      'new Function(""))',
      `const storage = [];
       const twoMegabytes = 1024 * 1024 * 2;
       while (true) {
         const array = new Uint8Array(twoMegabytes);
         for (let ii = 0; ii < twoMegabytes; ii += 4096) {
           array[ii] = 1;
         }
         storage.push(array);
       }
      `,
    ];
    for (const code of dangerous) {
      await expect(execute.executeCode(code, 'js')).to.eventually.be.rejected;
    }
  });
});
