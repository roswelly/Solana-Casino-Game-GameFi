import { Server, Socket, Namespace } from 'socket.io';

import * as Models from '../model';
import { getUserInfo, refund, sendGameResult } from '../controllers/client';

import { getNumber } from '../game';

interface UserType {
    name: string
    socketId: string
    bet: {
        [key: string]: {
            betAmount: number,
            winScore: number
        }
    }
    difficulty: string
    balance: number
}

const DEFAULT_USER = {
    name: '',
    socketId: '',
    difficulty: '',
    balance: 0,
    bet: {}
}

// let mysocketIo: Namespace;

let users = {} as { [key: string]: UserType }
let sockets = {} as { [key: string]: Socket }

// ----------------------------------------------------

export const initSocket = (io: Server) => {
    // mysocketIo = io;

    io.on("connection", async (socket) => {
        console.log("new User connected:" + socket.id);
        sockets[socket.id] = socket;

        socket.on("disconnect", async () => {
            console.log("socket disconnected " + socket.id);

            const userKeys = Object.keys(users).filter((key) => {
                return users[key].socketId === socket.id
            })

            if(userKeys.length > 0){
                let winAmount = 0;
                const userBet = users[userKeys[0]].bet
                for(const key in userBet){
                    if(userBet[key].winScore){
                        winAmount += userBet[key].winScore * userBet[key].betAmount;
                    }
                }

                await Models.updateUserBalance(userKeys[0], users[userKeys[0]].balance + winAmount);
                await refund(userKeys[0]);

                delete users[userKeys[0]];
            }
        })

        socket.on("enter-room", async (data) => {
            /* Data type
                token: string
            */
            const res = await getUserInfo(data.token);

            if (!res.status) {
                socket.emit("user-info", {
                    status: false,
                    balance: 0,
                    username: 'Unregistered user',
                    userId: 'Unregistered user',
                    link: ''
                });
            } else {
                users[res.data.userId] = {
                    ...DEFAULT_USER,
                    name: res.data.name,
                    balance: res.data.balance,
                    socketId: socket.id,
                }

                socket.emit("user-info", {
                    status: true,
                    balance: res.data.balance,
                    username: res.data.name,
                    userId: res.data.userId,
                    link: res.data.link
                });
            }
        })

        socket.on("play-bet", async (data) => {
            /* Data type
                betId: number
                userId: string,
                difficulty: string,
                betAmount: number
            */
            const u = users[data.userId];

            if (u) {
                const res = await Models.DUsers.findOne({ userId: data.userId });

                if (!!res) {
                    if(data.betAmount >= 10){
                        const balance = res.balance - data.betAmount;
                        if (balance >= 0) {
                            Models.updateUserBalance(data.userId, balance);
                            const betResult = getNumber({difficulty: data.difficulty});
    
                            u.balance = balance;
                            u.difficulty = data.difficulty;
                            u.bet = {
                                ...u.bet,
                                [data.ballId]: {
                                    betAmount: data.betAmount,
                                    winScore: betResult.odds
                                }
                            }
    
                            socket.emit("bet-result", {
                                ballId: data.ballId,
                                balance: balance,
                                point: betResult.target,
                                target: betResult.odds,
                                difficulty: data.difficulty
                            });
                        } else {
                            socket.emit("error", "Your balance is not enough!");
                        }
                    } else {
                        socket.emit("error", "Minimum bet amount is 10.00!");
                    }
                } else {
                    console.log("undefined user", u.name);
                }
            } else{
                socket.emit("error", "Unregistered user!");
            }
        })

        socket.on('end-bet', (data) => {
            const u = users[data.userId];

            if (u) {
                if(u.bet[data.ballId]){
                    const winAmount = u.bet[data.ballId].betAmount * u.bet[data.ballId].winScore;
                    const newBalance = u.balance + winAmount;
                    u.balance = newBalance;
                    Models.updateUserBalance(data.userId, newBalance);

                    socket.emit('balance', {
                        balance: newBalance
                    })
                    
                    if(u.bet[data.ballId].betAmount !== 0){
                        io.emit('history', {
                            username: u.name,
                            odds: u.bet[data.ballId].winScore,
                            betAmount: u.bet[data.ballId].betAmount
                        })

                        const sendData = {
                            userId: data.userId,
                            wonAmount: (winAmount *100).toString(),
                            betAmount: (u.bet[data.ballId].betAmount*100).toString(),
                            odds: u.bet[data.ballId].winScore.toString(),
                            status: winAmount >= u.bet[data.ballId].betAmount ? 1 : 0,
                        }
    
                        sendGameResult(sendData)
                    }

                    delete users[data.userId].bet[data.ballId];
                }
            }
        })

        socket.on('refund', async (data) => {
            const res = await refund(data.userId);
            const userKeys = Object.keys(users).filter((key) => {
                return users[key].socketId === socket.id
            })
            delete users[userKeys[0]];

            const returnStatus = res ? true : false;
            socket.emit('refund', {status: returnStatus, balance: 0})
        })
    });
};