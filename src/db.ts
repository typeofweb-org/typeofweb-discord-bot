import type { Db } from 'mongodb';
import { MongoClient } from 'mongodb';

import { getConfig } from './config';

export type StatsCollection = {
  readonly memberId: string;
  readonly memberName: string;
  readonly messagesCount: number | undefined | null;
  readonly updatedAt: Date;
  readonly yearWeek?: string | null;
};

export const initDb = async () => {
  const mongoUrl = getConfig('MONGO_URL');
  const dbName = mongoUrl.split('/').pop();
  const mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);
  return db;
};

export const getStatsCollection = (db: Db) => {
  return db.collection<StatsCollection>('stats');
};
