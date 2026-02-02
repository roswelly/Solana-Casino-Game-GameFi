import { Request, Response } from "express";
import Axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import * as Models from '../model';
import config from "../config.json";

let packageId = '';

export const getGameInfo = async (req: Request, res: Response) => {
    try {
        const data = {}
        res.json({ status: true, data });
    } catch (error) {
        console.log("getGameInfo", error);
        res.send({ status: false });
    }
}

export const getUserInfo = async (token: string) => {
    try {
        if (token.includes('test')) {
            const userId = `test-${new Date().valueOf()}`
            Models.addUser('test-user', userId, 5000, 'default')

            return {
                status: true,
                data: {
                    name: 'test-user',
                    userId: userId,
                    balance: 5000,
                }
            }
        } else {
            const resData = await Axios.post(config.getUserInfoURL, {
                ptxid: uuidv4(),
                token: token
            })
            const _data = resData.data.data;
            let balance = 0;

            packageId = _data.packageId;
            const userData = await Models.DUsers.findOne({ "userId": _data.userId });

            if (userData) {
                if (userData.balance > 0) {
                    return {
                        status: true,
                        data: {
                            name: userData.username,
                            userId: userData.userId,
                            balance: userData.balance,
                        }
                    };
                }
            } else {
                await Models.addUser(_data.userName, _data.userId, 0, _data.avatar)
            }

            const resData1 = await Axios.post(config.getBalanceURL, {
                ptxid: uuidv4(),
                userId: _data.userId,
                token: _data.userToken,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'packageId': _data.packageId,
                    'gamecode': 'Plinko'
                }
            })

            let link = '';
            if (Number(resData1.data.data.balance) === 0 && 'url' in resData1.data.data) {
                link = resData1.data.data.url;
            }

            if (Number(resData1.data.data.balance) !== 0) {
                balance = Number(resData1.data.data.balance) / 100;
                Models.updateUserBalance(_data.userId, balance);
            }
            console.log("Get UserInfo from Platform : id-", _data.userId, "balance-", balance*100);

            return {
                status: true,
                data: {
                    name: _data.userName,
                    userId: _data.userId,
                    balance: balance,
                    link: link
                }
            };
        }
    } catch (err) {
        console.error(err);
        return { status: false, data: {} };
    }
}

export const refund = async (userId: string) => {
    try {
        if (packageId && !userId.includes('test')) {
            const userData = await Models.DUsers.findOne({ "userId": userId });
            if (userData.balance > 0) {
                await Axios.post(config.reFundURL, {
                    ptxid: uuidv4(),
                    userId: userId,
                    balance: userData.balance * 100
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'packageId': packageId,
                        'gamecode': 'Plinko'
                    }
                })
                console.log("Refund to platform : userId-", userId, "balance-", userData.balance * 100);
                Models.updateUserBalance(userId, 0);
            }

            return { status: true }
        } else {
            return { status: false }
        }
    } catch (err) {
        console.error(err)
        return { status: false }
    }
}

export const sendGameResult = async (data: { userId: string, wonAmount: string, betAmount: string, odds: string, status: number }) => {
    try {
        if (packageId) {
            Axios.request({
                method: 'POST',
                url: config.orderURL,
                headers: {
                    'Content-Type': 'application/json',
                    'gamecode': 'Plinko'
                },
                data: {
                    ptxid: uuidv4(),
                    iGamingOrders: [
                        {
                            ...data,
                            packageId: packageId,
                            timestamp: new Date().valueOf().toString()
                        }
                    ]
                }
            }).then(function (response) {
                console.log("Send orders to platform : data-", {
                    ptxid: uuidv4(),
                    iGamingOrders: [
                        {
                            ...data,
                            packageId: packageId,
                            timestamp: new Date().valueOf().toString()
                        }
                    ]
                })

                console.log(response.data);
            }).catch(function (error) {
                console.error(error);
            });
        }
    } catch (err) {
        console.error(err);
    }
}