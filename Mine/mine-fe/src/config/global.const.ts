export const config = {
  serverHost: process.env.REACT_APP_API_URL,
  wwsHost: process.env.REACT_APP_WWS_URL,
  appKey: process.env.REACT_APP_APP_TOKEN_KEY,
  tokenString:
    JSON.parse(localStorage.getItem(`${process.env.REACT_APP_APP_TOKEN_KEY}`) as any)?.token ||
    JSON.parse(sessionStorage.getItem(`${process.env.REACT_APP_APP_TOKEN_KEY}`) as any)?.token,
  minBetAmount: 10,
  maxBetAmout: 1000
};
