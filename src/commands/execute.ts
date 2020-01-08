import { Command } from '../types';
import { Message } from 'discord.js';
import lodash from 'lodash';
import * as ts from 'typescript';
import { VM, CompilerFunction } from 'vm2';

/* config */
const MaxOutputLines = 20;

const NodeLanguages: { [key: string]: 'javascript' | CompilerFunction } = {
  js: 'javascript',
  ts(code: string): string {
    const out = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        alwaysStrict: true,
      },
    });
    return out.outputText;
  },
};

type ResultType = number | string | object;

export interface ExecuteResult {
  stdout: string[];
  result: ResultType;
  time?: number;
}

export function parseArg(arg: ResultType) {
  if (typeof arg === 'object') {
    return JSON.stringify(arg);
  }
  return arg;
}

export function parseMessage(msg: string) {
  const TicksCount = 3;
  const opening = msg.indexOf('```');
  const closing = msg.lastIndexOf('```');
  const newline = msg.indexOf('\n', opening + TicksCount);
  if (opening === -1 || newline === -1) {
    throw new Error('Nieprawidłowa składnia');
  }
  const source = msg.substring(newline + 1, closing);
  const language = msg.substring(opening + TicksCount, newline).toLowerCase();
  return {
    source,
    language: language.length > 0 ? language : 'js',
  };
}

export function executeCode(source: string, language: string): ExecuteResult {
  if (!(language in NodeLanguages)) {
    throw new Error(`Nieobsługiwany język ${language}`);
  }
  const stdout: string[] = [];
  const vm = new VM({
    timeout: 100,
    compiler: NodeLanguages[language],
    eval: false,
    sandbox: {
      _: lodash,
      console: {
        log: (...args: ResultType[]) => {
          stdout.push(args.map(parseArg).join(', '));
        },
      },
    },
  });
  const begin = new Date().getTime();
  const result = vm.run(source);
  const end = new Date().getTime();
  return {
    stdout,
    result,
    time: end - begin,
  };
}

export function writeResponse(result: ExecuteResult): string {
  const stdout =
    result.stdout.length === 0
      ? ''
      : `Wyjście (${result.stdout.length} linii): \n\`\`\`` +
        result.stdout.slice(0, MaxOutputLines).join('\n') +
        `${result.stdout.length > MaxOutputLines ? '\n...\n```' : '\n```'}`;
  const codeResult =
    (result.time ? `Wynik (${result.time} ms):` : 'Wynik: ') + '```\n' + result.result + '\n```';
  return stdout + codeResult;
}

const errorMessage = (error: Error | string) =>
  `Błąd wykonania: ${error}\n` +
  'Poprawna składnia to:\n ' +
  '> !execute \\`\\`\\`js\n' +
  '> // kod\n' +
  '> \\`\\`\\`\n' +
  'Obsługiwane języki: js, ts';

const execute: Command = {
  name: 'execute',
  description: 'Wykonuje kod JS/TS',
  args: false,
  cooldown: 0,
  async execute(msg: Message) {
    try {
      const { source, language } = parseMessage(msg.content);
      const result = executeCode(source, language);
      const response = writeResponse(result);
      return msg.channel.send(response);
    } catch (error) {
      return msg.channel.send(errorMessage(error));
    }
  },
};

export default execute;
