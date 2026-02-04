declare interface SchemaUser {
  _id: string;
  name: string;
  avatar: string;
  balance: number;
  updated: number;
  created: number;
}

declare interface SchemaGame {
  _id: number;
  minBetAmount: number;
  maxBetAmount: number;
}

declare interface SchemaHistory {
  userid: string;
  betAmount: number;
  profit: number;
  profitAmount: number;
  date: number;
}
