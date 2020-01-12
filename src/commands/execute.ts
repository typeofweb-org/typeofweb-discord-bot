import { Command } from '../types';
import { Message } from 'discord.js';
import { polishPlurals } from 'polish-plurals';
import * as ts from 'typescript';
import ivm from 'isolated-vm';

const pluralize = (count: number) => polishPlurals('linia', 'linie', 'linii', count);

export const MAX_OUTPUT_LINES = 20;
export const MAX_OUTPUT_CHARACTERS = 1200;
export const MAX_RESULT_CHARACTERS = 700;
const MAX_ARRAY_ITEMS = 100;
const TIMEOUT = 10;
const MEMORY_LIMIT = 32;
const COOLDOWN = 60;

const jsTranspilers: { [key: string]: (code: string) => Promise<string> } = {
  async js(code: string) {
    return code;
  },
  async ts(code: string) {
    const out = ts.transpileModule(code, {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        alwaysStrict: true,
      },
    });
    return out.outputText;
  },
};
jsTranspilers.javascript = jsTranspilers.js;
jsTranspilers.typescript = jsTranspilers.ts;

type ResultType = number | string | object | null | undefined;

export interface ExecutionResult {
  stdout: string[];
  result: ResultType;
  time?: number;
}

export interface Stdout {
  text: string;
  lines: number;
}

export function parseArg(arg: ResultType) {
  if (Array.isArray(arg)) {
    return JSON.stringify(arg.slice(0, MAX_ARRAY_ITEMS));
  } else if (ArrayBuffer.isView(arg)) {
    return JSON.stringify(Array.from((arg as Uint8Array).slice(0, MAX_ARRAY_ITEMS)));
  } else if (typeof arg === 'object') {
    return JSON.stringify(arg);
  } else if (typeof arg !== 'undefined' && arg !== null) {
    return arg.toString();
  }
  return 'undefined';
}

export function parseMessage(msg: string) {
  const DELIMITER = '```';
  const opening = msg.indexOf(DELIMITER);
  const closing = msg.lastIndexOf(DELIMITER);
  const newline = msg.indexOf('\n', opening + DELIMITER.length);
  if (opening === -1 || newline === -1 || closing === opening) {
    throw new Error('Nieprawidłowa składnia');
  }
  const source = msg.substring(newline + 1, closing);
  const language = msg.substring(opening + DELIMITER.length, newline).toLowerCase();
  return {
    source,
    language: language.length > 0 ? language : 'js',
  };
}

const consoleWrapCode = /*JavaScript*/ `
__logs = [];
eval = void 0;
console = {
  log (...args) {
    __logs.push(args)
  },
  info (...args) {
    __logs.push(['[i]'].concat(args))
  },
  debug (...args) {
    __logs.push(['[d]'].concat(args))
  },
  error (...args) {
    __logs.push(['[e]'].concat(args))
  }
}`;

export async function executeCode(source: string, language: string): Promise<ExecutionResult> {
  if (!jsTranspilers[language]) {
    throw new Error(`Nieobsługiwany język ${language}`);
  }
  const code = await jsTranspilers[language](source);
  const vm = new ivm.Isolate({
    memoryLimit: MEMORY_LIMIT,
  });
  const context = await vm.createContext();
  await context.eval(consoleWrapCode);

  const config = {
    timeout: TIMEOUT,
    promise: false,
    copy: false,
    externalCopy: true,
    reference: false,
  };

  try {
    const begin = new Date().getTime();
    const exeResult = await context.eval(code, config);
    const result = exeResult.result.copy({ transferIn: true });
    const rawStdout = (await context.eval('__logs', config)).result.copy({
      transferIn: true,
    }) as ResultType[][];
    const end = new Date().getTime();
    const stdout = rawStdout.map(row => row.map(parseArg).join(', '));
    return {
      stdout,
      result,
      time: end - begin,
    };
  } catch (error) {
    throw error;
  } finally {
    context.release();
    vm.dispose();
  }
}

function wrapText(text: string, lang = '') {
  return `\`\`\`${lang}\n${text}\n\`\`\``;
}

export function prepareOutput(result: ExecutionResult) {
  return {
    text: result.stdout
      .slice(0, MAX_OUTPUT_LINES)
      .join('\n')
      .slice(0, MAX_OUTPUT_CHARACTERS),
    lines: result.stdout.length,
  };
}

export function writeResponse(result: ExecutionResult): string {
  const stdout = prepareOutput(result);
  const isCut = stdout.text.length !== result.stdout.join('\n').length;
  const stdoutText =
    stdout.lines === 0
      ? ''
      : `Wyjście (${stdout.lines} ${pluralize(stdout.lines)}): ${wrapText(
          stdout.text + (isCut ? '\n...' : '')
        )}\n`;
  const codeResult =
    `Wynik (${result.time} ms): ` +
    wrapText(parseArg(result.result).substr(0, MAX_RESULT_CHARACTERS), 'json');
  return stdoutText + codeResult;
}

const errorMessage = (error: Error | string) =>
  `Błąd: ${error}\n` +
  'Poprawna składnia to:\n ' +
  '> !execute \\`\\`\\`js\n' +
  '> // kod\n' +
  '> \\`\\`\\`\n' +
  `Obsługiwane języki: ${Object.keys(jsTranspilers).join(', ')}`;

const execute: Command = {
  name: 'execute',
  description: 'Wykonuje kod JS/TS',
  args: false,
  cooldown: COOLDOWN,
  async execute(msg: Message) {
    try {
      const { source, language } = parseMessage(msg.content);
      try {
        const result = await executeCode(source, language);
        const response = writeResponse(result);
        return msg.channel.send(response);
      } catch (error) {
        return msg.channel.send(`Błąd wykonania: \`\`\`\n${error}\n\`\`\``);
      }
    } catch (error) {
      return msg.channel.send(errorMessage(error));
    }
  },
};

export default execute;
