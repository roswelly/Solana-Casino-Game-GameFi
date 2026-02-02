import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuthStore } from '../../store/auth'

import { Loading } from '../../components/Loading'
import Game from '../../components/Game';
import BetStatus from '../../components/BetStatus';

import { HistoryType } from '../../@types';

import { socket } from '../../socket';
import Modal from '../../components/Modal';

const Home = () => {
    const [searchParams] = useSearchParams();

    const setUser = useAuthStore(state => state.setUser)
    const setBalance = useAuthStore(state => state.setBalance)
    const setLoading = useAuthStore(state => state.setLoading)
    const isLoading = useAuthStore((state) => state.isLoading);

    const [ history, setHistory ] = useState<Array<HistoryType>>([]);
    const [ isCharge, setIsCharge ] = useState(false);
    const [ chargLink, setChargeLink ] = useState('#');

    const CreaditModal = () => {
        return (
            <div className="w-full rounded-md bg-secondary px-[15px] sm:px-[30px] py-[20px]">
                <h2 className="text-center text-[28px]">Charge credits</h2>
                <div className="text-center mt-[20px] text-[18px] mb-[20px]">Please charge your credits by clicking <a className="decoration-blue underline text-blue" href={chargLink ? chargLink : 'http://annie.ihk.vipnps.vip/iGaming-web/'}>here</a>.</div>
          </div>
        )
    }

    useEffect(() => {
        socket.on('connect', () => {
            const socketId = socket.io.engine.id as string;
            console.log(`socket id: ${socketId} connected`);

            const token = searchParams.get('cert') || 'test-user';
            socket.emit('enter-room', {
                token: token
            })

            setLoading(true);
        });

        socket.on('disconnect', () => {
            console.log('socket disconnected')
            setLoading(true);
        });

        socket.on('user-info', (data: any) => {
            console.log('user-info = ', data);
            setUser({
                id: data.userId,
                name: data.username
            });
            setBalance(Number(data.balance));
            setLoading(false);
            if(Number(data.balance) === 0){
                setChargeLink(data.link);
                setIsCharge(true);
            }
            
            if(!data.status) {
                window.alert('Server Error!');
            }
        });
        
        socket.on('history', (data: any) => {
            setHistory(prev => {
                if(prev.length > 19){
                    prev.pop();
                }
                return [data, ...prev]
            });
        })

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('user-info');
            socket.off('history');
        };
    }, [])
    return (
        <>
            {
                isLoading ? <Loading /> :
                <> 
                    <div className="flex flex-col md:flex-row w-full justify-center items-start sm:items-center md:items-start xl:justify-between pt-[20px] pb-[30px] x-page">
                        <Game />
                        <BetStatus history = {history}/>
                    </div>
                    { isCharge && <Modal data = {CreaditModal} /> }
                </>
            }
        </>
    )
}

export default Home;