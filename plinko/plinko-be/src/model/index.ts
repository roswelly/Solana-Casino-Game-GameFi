import { MongoClient } from "mongodb";
import dotenv from "dotenv";
dotenv.config();

import config from "../config.json";

const mongodb_url = process.env.DB_URL as string;
console.log("mongodb_url :>> ", mongodb_url);
const client = new MongoClient(mongodb_url);
const db = client.db(config.database);
export const DEFAULT_GAMEID = 1;

export const DUsers = db.collection<SchemaUser>("users");

const lastIds = {
  lastHistoryId: 0,
  lastUserId: 0,
};

export const connect = async () => {
  try {
    await client.connect();
    const d1 = await DUsers.aggregate([
      { $group: { _id: null, max: { $max: "$_id" } } },
    ]).toArray();
    lastIds.lastUserId = d1?.[0]?.max || 0;

    return true;
  } catch (error) {
    console.log("mongodb-initialization", error);
    return error;
  }
};

export const addUser = async (
  name: string,
  user_id: string,
  balance: number,
  img: string
) => {
  try {
    await DUsers.insertOne({
      _id: ++lastIds.lastUserId,
      userId: user_id,
      username: name,
      balance,
      img,
    });
    return true;
  } catch (error) {
    console.log("addUser", error);
    return false;
  }
};

export const updateUserBalance = async (userId: string, balance: number) => {
  try {
    await DUsers.updateOne({ userId }, { $set: { balance } });
    return true;
  } catch (error) {
    console.log("updateUserBalance", error);
    return false;
  }
};
