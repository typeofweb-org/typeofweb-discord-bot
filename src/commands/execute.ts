import { Command } from '../types';
import { Message } from 'discord.js';
import lodash from 'lodash';
import * as ts from 'typescript';
import { VM, CompilerFunction } from 'vm2';
import { polishPlurals } from 'polish-plurals';

const pluralize = (count: number) => polishPlurals('linia', 'linie', 'linii', count);

/* config */
export const MaxOutputLines = 20;
export const MaxOutputCharacters = 1600;
const Cooldown = 30;

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

export interface Stdout {
  text: string;
  lines: number;
}

export function parseArg(arg: ResultType) {
  if (typeof arg === 'object') {
    return JSON.stringify(arg);
  } else if (typeof arg !== 'undefined' && arg !== null) {
    return arg.toString();
  } else {
    return arg;
  }
}

export function parseMessage(msg: string) {
  const Delimiter = '```';
  const opening = msg.indexOf(Delimiter);
  const closing = msg.lastIndexOf(Delimiter);
  const newline = msg.indexOf('\n', opening + Delimiter.length);
  if (opening === -1 || newline === -1) {
    throw new Error('Nieprawidłowa składnia');
  }
  const source = msg.substring(newline + 1, closing);
  const language = msg.substring(opening + Delimiter.length, newline).toLowerCase();
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

function wrapText(text: string, lang = '') {
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

export function prepareOutput(result: ExecuteResult) {
  return {
    text: result.stdout
      .slice(0, MaxOutputLines)
      .join('\n')
      .slice(0, MaxOutputCharacters),
    lines: result.stdout.length,
  };
}

export function writeResponse(result: ExecuteResult): string {
  const stdout = prepareOutput(result);
  const isCut = stdout.text.length !== result.stdout.join('\n').length;
  const stdoutText =
    stdout.lines === 0
      ? ''
      : `Wyjście (${stdout.lines} ${pluralize(stdout.lines)}): ${wrapText(
          stdout.text + (isCut ? '\n...' : '')
        )}\n`;
  const codeResult = `Wynik (${result.time} ms): ` + wrapText(parseArg(result.result), 'json');
  return stdoutText + codeResult;
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
  cooldown: Cooldown,
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
