import { Server, Socket } from 'socket.io';
import uniqid from 'uniqid';
import axios from 'axios';
import { DUsers, DHistories } from '../model';
import { currentTime } from '../helper';
import config from '../config.json';

const random = require('random-seed').create();

interface UserType {
  socketId: string;
  userid: string;
  username: string;
  avatar: string;
  balance: number;
  betAmount: number;
  mineCount: number;
  minePlace: number[];
  gridSystem: boolean[];
  turboMode: boolean;
  turboList: number[];
  profitCalcList: number[];
  apiToken: string;
  loading: boolean;
}

let users = {} as { [key: string]: UserType };
let packageId = '';

const register = async (user: any) => {
  try {
    const oldUser = await DUsers.findOne({ _id: user.userid });
    const now = currentTime();
    if (oldUser) {
      const update = await DUsers.updateOne(
        { _id: user.userid },
        {
          $set: {
            balance: user.balance
          }
        }
      );
      return update ? true : false;
    } else {
      const insert = await DUsers.insertOne({
        _id: user.userid,
        name: user.username,
        avatar: user.avatar,
        balance: user.balance,
        updated: now,
        created: now
      });
      return insert ? true : false;
    }
  } catch (error) {
    console.log('register error : ', error.message);
  }
};

const makeGridSystem = async (gridCount: number, wicketCount: number) => {
  let minePlace: number[] = [];
  while (minePlace.length < wicketCount) {
    const ran = random.intBetween(0, gridCount * gridCount - 1);
    minePlace.indexOf(ran) < 0 && minePlace.push(ran);
  }
  minePlace.sort((a: number, b: number) => {
    return a - b;
  });

  let gridSystem: boolean[] = new Array(gridCount * gridCount).fill(false);
  minePlace.map((item: number) => {
    gridSystem[item] = true;
  });

  return { minePlace, gridSystem };
};

const updateBalance = async (userid: string, status: string, amount: number) => {
  if (!userid && !users[userid].socketId) {
    return {
      status: false,
      message: 'Undefined user',
      amount: null
    };
  }

  const user = users[userid].apiToken ? await DUsers.findOne({ _id: userid }) : users[userid];

  if (!user) {
    return { status: false, message: 'Undefined user', amount: null };
  }

  let calc: number = user.balance;

  if (status === 'playBet' && user.balance - amount < 0) {
    return {
      status: false,
      message: 'Insufficient your balance',
      amount: null
    };
  }

  switch (status) {
    case 'playBet':
      calc = calc - amount;
      break;
    case 'cancelBet':
      calc = calc + amount;
      break;
    case 'cashOut':
      calc = calc + amount;
  }

  if (users[userid].apiToken) {
    const update = await DUsers.updateOne({ _id: userid }, { $set: { balance: calc, updated: currentTime() } });

    if (!update) {
      return { status: false, message: 'User balance updating is failed', amount: null };
    }
  }

  return { status: true, message: 'Successfully', amount: calc };
};

const checkMine = async (userid: string, order: number) => {
  if (!userid && !users[userid].socketId) {
    return {
      status: false,
      message: 'Undefined user',
      minePlace: [],
      index: -1,
      mine: null
    };
  }
  return {
    status: true,
    message: 'Successfully',
    index: order,
    minePlace: users[userid].minePlace,
    mine: users[userid].gridSystem[order]
  };
};

const makeProfitCalcList = async (userid: string, gridCount: number, wicketCount: number) => {
  if (!userid && !users[userid].socketId) {
    return {
      status: false,
      message: 'Undefined user',
      list: []
    };
  }
  let list: number[] = [];
  let first = 0.95 / ((gridCount * gridCount - wicketCount) / (gridCount * gridCount));
  list.push(Number(first.toFixed(2)));
  for (let i = gridCount * gridCount - wicketCount - 1; i > 0; i--) {
    first /= i / (i + wicketCount);
    list.push(Number(first.toFixed(2)));
  }

  return {
    status: true,
    message: 'Successfully',
    list
  };
};

const refundBalance = async (userid: string) => {
  const update = await DUsers.updateOne({ _id: userid }, { $set: { balance: 0, updated: currentTime() } });
  return update ? true : false;
};

const getBalance = async (userid: string) => {
  if (!userid) {
    return {
      status: false,
      message: 'Undefined user',
      amount: 0
    };
  }
  const getBalance = await DUsers.findOne({ _id: userid });
  if (getBalance) {
    return {
      status: true,
      message: 'Successfully',
      amount: getBalance.balance
    };
  } else {
    return {
      status: false,
      message: 'Failed get user balance',
      amount: 0
    };
  }
};

const saveHistory = async (userid: string, betAmount: number, profit: number) => {
  const now = currentTime();
  const insert = await DHistories.insertOne({
    userid: userid,
    betAmount: betAmount,
    profit: profit,
    profitAmount: profit === 0 ? 0 : betAmount * profit - betAmount,
    date: now
  });

  if (!insert) {
    console.log('bet hostory save error', `${userid}`);
  }
};

const getHistory = async (userid: string, way: string, page: number, count: number) => {
  let total = 0;
  let data: any = [];
  if (way === 'mine') {
    total = (await DHistories.find({ userid: userid }).toArray()).length;
    data = await DHistories.find({ userid: userid })
      .sort({ date: -1 })
      .skip((page - 1) * count)
      .limit(count)
      .toArray();
  } else {
    total = (await DHistories.find().toArray()).length;
    data = await DHistories.find()
      .sort({ date: -1 })
      .skip((page - 1) * count)
      .limit(count)
      .toArray();
  }
  return { data, total };
};

export const initSocket = (io: Server) => {
  io.on('connection', async (socket: Socket) => {
    console.log('new User connected:' + socket.id);

    socket.on('disconnect', async () => {
      console.log('socket disconnected ' + socket.id);
      const userid = Object.keys(users).filter((key: string) => users[key].socketId === socket.id)[0];
      if (userid && users[userid].apiToken) {
        const balance = await getBalance(userid);
        if (balance.status) {
          const getUserInfo = await axios.post(
            config.reFundURL,
            { userId: userid, balance: balance.amount, ptxid: uniqid() },
            { headers: { 'Content-Type': 'application/json', gamecode: 'Mine', packageId: packageId } }
          );

          if (getUserInfo.data.success) {
            const result = await refundBalance(userid);
            if (!result) {
              console.log('refund update balance', `${userid}=> database error`);
            }
          } else {
            console.log('refund error', `${userid}=> platform error`);
          }
        } else {
          console.log('refund error', `${userid}=> ${balance.message}`);
        }
      }
      delete users[userid];
    });

    socket.on('join', async (req: any) => {
      try {
        if (req.token) {
          const getUserInfo = await axios.post(config.getUserInfoURL, { token: req.token, ptxid: uniqid() });
          if (getUserInfo.data.success) {
            let user: any = getUserInfo.data.data;
            packageId = user.packageId;
            if (!users[user.userId] || users[user.userId]?.balance < 0.1) {
              const getBalance = await axios.post(
                config.getBalanceURL,
                { userId: user.userId, token: user.userToken, ptxid: uniqid() },
                { headers: { 'Content-Type': 'application/json', gamecode: 'Mine', packageId: packageId } }
              );
              if (getBalance.data) {
                user.balance = getBalance.data.data.balance;
                users[user.userId] = {
                  socketId: socket.id,
                  userid: user.userId,
                  username: user.userName,
                  avatar: user.avatar,
                  balance: users[user.userId]
                    ? Number(users[user.userId].balance) + Number(getBalance.data.data.balance)
                    : Number(getBalance.data.data.balance),
                  betAmount: 0,
                  mineCount: 0,
                  minePlace: [],
                  gridSystem: [],
                  turboMode: false,
                  turboList: [],
                  profitCalcList: [],
                  apiToken: req.token,
                  loading: false
                };
              } else {
                console.log('not found user balance from platform');
              }
            }

            const result = await register(users[user.userId]);
            if (result) {
              socket.emit(`join-${req.token}`, users[user.userId]);
              if (users[user.userId].balance < 0.1) {
                socket.emit(`insufficient-${user.userId}`);
                return;
              }
            } else {
              delete users[user.userId];
              console.log('register error', `${user.userId}=> user register`);
            }
          } else {
            console.log('not found user from platform');
          }
        } else {
          let user = uniqid();
          users[user] = {
            socketId: socket.id,
            userid: user,
            username: user,
            avatar: user,
            balance: 1000,
            betAmount: 0,
            mineCount: 0,
            minePlace: [],
            gridSystem: [],
            turboMode: false,
            turboList: [],
            profitCalcList: [],
            apiToken: '',
            loading: false
          };
          socket.emit(`join-${req.token}`, users[user]);
        }
      } catch (err) {
        console.log('user join error');
        console.log(err);
      }
    });

    socket.on('setProfitCalcList', async (req: any) => {
      const result = await makeProfitCalcList(req.userid, req.gridCount, req.mineCount);
      if (result.status) {
        users[req.userid] = {
          ...users[req.userid],
          profitCalcList: result.list
        };

        socket.emit(`setProfitCalcList-${req.userid}`, { profitCalcList: result.list });
      } else {
        console.log('setProfitList error', `${req.userid}=>${result.message}`);
        socket.emit(`error-${req.userid}`, result.message);
      }
    });

    socket.on('playBet', async (req: any) => {
      const system = await makeGridSystem(req.gridCount, req.mineCount);
      const result = await updateBalance(req.userid, 'playBet', req.betAmount);

      if (result.status) {
        users[req.userid] = {
          ...users[req.userid],
          balance: result.amount,
          betAmount: req.betAmount,
          mineCount: req.mineCount,
          minePlace: system.minePlace,
          gridSystem: system.gridSystem,
          turboMode: req.turboMode,
          turboList: req.turboList
        };

        if (req.turboMode) {
          const count = users[req.userid].turboList.filter((item) => users[req.userid].gridSystem[item]).length;
          const balance =
            count > 0
              ? result.amount
              : (await updateBalance(req.userid, 'cashOut', req.betAmount * req.profitValue)).amount;

          users[req.userid] = {
            ...users[req.userid],
            balance: balance
          };

          await saveHistory(req.userid, req.betAmount, req.profitValue);

          socket.emit(`playBet-${req.userid}`, {
            balance: balance,
            turboMode: req.turboMode,
            mine: count > 0 ? true : false,
            gridSystem: system.gridSystem
          });

          if (users[req.userid].apiToken) {
            let wonAmount = count > 0 ? '0' : req.betAmount * req.profitValue - req.betAmount;
            let odds = count > 0 ? '0' : Number(req.profitValue).toString();
            let status = count > 0 ? 0 : 1;
            let sendORder = await axios.post(
              config.orderURL,
              {
                ptxid: uniqid(),
                iGamingOrders: [
                  {
                    'packageId': packageId,
                    'userId': (req.userid).toString(),
                    'wonAmount': (wonAmount).toString(),
                    'betAmount': (req.betAmount).toString(),
                    'odds': (odds).toString(),
                    'status': status,
                    'timestamp': new Date().getTime()
                  }
                ]
              }, {
              headers: {
                'Content-Type': 'application/json',
                  'packageId': packageId,
                'gamecode': 'Mine'
              }
            });

            console.log(sendORder.data,"Mine");
          }
        } else {
          socket.emit(`playBet-${req.userid}`, { balance: result.amount, turboMode: req.turboMode });
        }
      } else {
        console.log('playBet error', `${req.userid}=>${result.message}`);
        socket.emit(`error-${req.userid}`, result.message);
      }
    });

    socket.on('cancelBet', async (req: any) => {
      const result = await updateBalance(req.userid, 'cancelBet', req.betAmount);

      if (result.status) {
        users[req.userid] = {
          ...users[req.userid],
          balance: result.amount
        };
        socket.emit(`cancelBet-${req.userid}`, { balance: result.amount });
      } else {
        console.log('cancelBet error', `${req.userid}=>${result.message}`);
        socket.emit(`error-${req.userid}`, result.message);
      }
    });

    socket.on('cashOut', async (req: any) => {
      if (users[req.userid]) {
        const result = await updateBalance(req.userid, 'cashOut', req.profitValue * req.betAmount);
        users[req.userid] = {
          ...users[req.userid],
          balance: result.amount
        };
        await saveHistory(req.userid, req.betAmount, req.profitValue);
        socket.emit(`cashOut-${req.userid}`, { balance: result.amount });
        if (users[req.userid].apiToken) {
          let sendORder = await axios.post(
            config.orderURL,
            {
              ptxid: uniqid(),
              iGamingOrders: [
                {
                  'packageId': packageId,
                  'userId': (req.userid).toString(),
                  'wonAmount': (req.profitValue * req.betAmount).toString(),
                  'betAmount': (req.betAmount).toString(),
                  'odds': (req.profitValue).toString(),
                  'status': 1,
                  'timestamp': new Date().getTime()
                }
              ]
            }, {
            headers: {
              'Content-Type': 'application/json',
                'packageId': packageId,
              'gamecode': 'Mine'
            }
          });
          console.log("Mine:", req.userid, req.profitValue * req.betAmount, req.betAmount, req.profitValue);
          console.log('Types :', typeof req.userid, typeof (req.profitValue * req.betAmount), typeof req.betAmount, typeof req.profitValue, sendORder.data);
        }
      } else {
        console.log('cashOut error', `${req.userid}=> Undefined user`);
        socket.emit(`error-${req.userid}`, 'Undefined user');
      }
    });

    socket.on('checkMine', async (req: any) => {
      const result = await checkMine(req.userid, req.order);

      if (result.status) {
        socket.emit(`checkMine-${req.userid}`, { mine: result.mine, index: result.index, minePlace: result.minePlace });
        result.mine && (await saveHistory(req.userid, req.betAmount, 0));
        if (result.mine && users[req.userid].apiToken) {
          const options = {
            method: 'POST',
            url: config.orderURL,
            headers: { 'Content-Type': 'application/json', gamecode: 'Mine', packageId: packageId },
            data: {
              ptxid: uniqid(),
              iGamingOrders: [
                {
                  packageId: packageId,
                  userId: (req.userid).toString(),
                  wonAmount: '0',
                  betAmount: (req.betAmount).toString(),
                  odds: '0',
                  status: 0,
                  timestamp: new Date().getTime()
                }
              ]
            }
          };
          axios
            .request(options)
            .then(function (response) {
              console.log(response.data,options,"send order when lose");
            })
            .catch(function (error) {
              console.error(error);
            });
        }
      } else {
        console.log('checkMine error', `${req.userid}=>${result.message}`);
        socket.emit(`error-${req.userid}`, result.message);
      }
    });

    socket.on('refund', async (req: any) => {
      if (users[req.userid]?.apiToken) {
        const balance = await getBalance(req.userid);

        if (!users[req.userid]?.loading) {
          users[req.userid].loading = true;
          if (balance.status) {
            const getUserInfo = await axios.post(
              config.reFundURL,
              { userId: req.userid, balance: balance.amount, ptxid: uniqid() },
              { headers: { 'Content-Type': 'application/json', gamecode: 'Mine', packageId: packageId } }
            );
            if (getUserInfo.data.success) {
              const result = await refundBalance(req.userid);
              if (result) {
                delete users[req.userid];
                socket.emit(`refund-${req.userid}`);
              } else {
                console.log('refund update balance', `${req.userid}=> database error`);
              }
            } else {
              console.log('refund error', `${req.userid}=> platform error`);
            }
          } else {
            console.log('refund error', `${req.userid}=> ${balance.message}`);
            socket.emit(`error-${req.userid}`, "Can't find the platform");
          }
        }
      } else {
        delete users[req.userid];
        socket.emit(`refund-${req.userid}`);
      }
    });

    socket.on('getHistory', async (req: any) => {
      const data = await getHistory(req.userid, req.historyWay, req.currentPage, req.displayCount);
      socket.emit(`getHistory-${req.userid}`, data);
    });
  });
};
