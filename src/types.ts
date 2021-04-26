import type Discord from 'discord.js';

interface CommandCommon {
  readonly name: string;
  readonly description: string;
  readonly guildOnly?: boolean;
  readonly permissions?: Discord.PermissionResolvable;
  readonly cooldown?: number;
}

type CommandWithArgs = {
  readonly args: true | 'optional';
  execute(
    msg: Discord.Message,
    args: readonly string[],
  ): Promise<Discord.Message | readonly Discord.Message[] | null>;
} & CommandCommon;

type CommandWithoutArgs = {
  readonly args: false;
  execute(msg: Discord.Message): Promise<Discord.Message | readonly Discord.Message[]>;
} & CommandCommon;

export type Command = CommandWithArgs | CommandWithoutArgs;

export class InvalidUsageError extends Error {}
