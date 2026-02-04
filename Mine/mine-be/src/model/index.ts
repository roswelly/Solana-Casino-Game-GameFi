import { MongoClient } from 'mongodb';

import config from '../config.json';
import { currentTime } from '../helper';

// Allow Mongo connection details to be provided via environment variables.
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017';
const dbName = process.env.MONGO_DB || process.env.MONGODB_DB || config.database;

const client = new MongoClient(mongoUri);
const db = client.db(dbName);
export const DEFAULT_GAMEID = 1;

export const DUsers = db.collection<SchemaUser>('users');
export const DGame = db.collection<SchemaGame>('game');
export const DHistories = db.collection<SchemaHistory>('histories');

const lastIds = {
  lastHistoryId: 0,
  lastUserId: 0
};

export const connect = async () => {
  try {
    await client.connect();
    await DUsers.createIndex({ name: 1 }, { unique: true, name: 'users-name' });
    await DHistories.createIndex({ name: 1 }, { unique: false, name: 'logs-name' });
    await DHistories.createIndex({ date: 1 }, { unique: false, name: 'logs-date' });

    const d = await DHistories.aggregate([{ $group: { _id: null, max: { $max: '$_id' } } }]).toArray();
    lastIds.lastHistoryId = d?.[0]?.max || 0;
    const d1 = await DUsers.aggregate([{ $group: { _id: null, max: { $max: '$_id' } } }]).toArray();
    lastIds.lastUserId = d1?.[0]?.max || 0;
    return true;
  } catch (error) {
    console.log('mongodb-initialization', error);
    return error;
  }
};
