import Discord from 'discord.js';

interface CommandCommon {
  name: string;
  aliases?: string[];
  description: string;
  guildOnly?: boolean;
  permissions?: Discord.PermissionResolvable;
  cooldown?: number;
}

type CommandWithArgs = {
  args: true;
  execute(
    msg: Discord.Message,
    args: string[]
  ): Promise<Discord.Message | Discord.Message[] | null>;
} & CommandCommon;

type CommandWithoutArgs = {
  args: false;
  execute(msg: Discord.Message): Promise<Discord.Message | Discord.Message[]>;
} & CommandCommon;

export type Command = CommandWithArgs | CommandWithoutArgs;

export class InvalidUsageError extends Error {}
