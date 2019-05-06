declare module 'discord.rss' {
  import EventEmitter from 'events';
  import Discord from 'discord.js';

  interface Log {
    dates?: boolean;
    linkErrs?: boolean;
    unfiltered?: boolean;
    failedFeeds?: boolean;
  }

  interface CommandAliases {}

  interface Bot {
    token?: string;
    enableCommands?: boolean;
    prefix?: string;
    status?: string;
    activityType?: string;
    activityName?: string;
    streamActivityURL?: string;
    controllerIds?: string[];
    menuColor?: number;
    deleteMenus?: boolean;
    exitOnSocketIssues?: boolean;
    commandAliases?: CommandAliases;
  }

  interface Connection {
    useNewUrlParser?: boolean;
  }

  interface Database {
    uri: string;
    connection?: Connection;
    clean?: boolean;
    articlesExpire?: number;
    guildBackupsExpire?: number;
  }

  interface Decode {}

  interface Feeds {
    refreshTimeMinutes?: number;
    checkTitles?: boolean;
    timezone?: string;
    dateFormat?: string;
    dateLanguage?: string;
    dateLanguageList?: string[];
    dateFallback?: boolean;
    timeFallback?: boolean;
    failLimit?: number;
    notifyFail?: boolean;
    sendOldOnFirstCycle?: boolean;
    cycleMaxAge?: number;
    defaultMessage?: string;
    imgPreviews?: boolean;
    imgLinksExistence?: boolean;
    checkDates?: boolean;
    formatTables?: boolean;
    toggleRoleMentions?: boolean;
    decode?: Decode;
  }

  interface Advanced {
    shards?: number;
    batchSize?: number;
    processorMethod?: string;
    parallel?: number;
  }

  enum LogLevel {
    error = 'error',
    success = 'success',
    warning = 'warning',
    info = 'info',
  }

  export interface ClientConfig {
    log?: Log;
    bot?: Bot;
    database: Database;
    feeds?: Feeds;
    advanced?: Advanced;
    suppressLogLevels?: Array<LogLevel>;
  }

  interface CustomSchedule {
    name?: string;
    refreshTimeMinutes?: number;
    keywords?: string[];
  }

  export type CustomSchedules = Array<CustomSchedule>;

  class Client extends EventEmitter {
    constructor(config: ClientConfig, customSchedules?: CustomSchedules);

    login(token: string | Discord.Client | Discord.ShardingManager, noChildren?: boolean): void;

    _defineBot(client: Discord.Client): void;

    listenToShardedEvents(bot: Discord.Client);

    stop();

    start(callback?: () => any);

    restart(callback?: () => any);

    disableCommands();
  }

  export default {
    Client,
  };
}
