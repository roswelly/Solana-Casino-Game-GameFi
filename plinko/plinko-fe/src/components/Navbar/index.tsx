import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import classNames from 'classnames'
import { CurrencyInr } from 'phosphor-react'
import { BiWalletAlt } from "react-icons/bi";

import { useAuthStore } from '../../store/auth'
import { useGameStore } from '../../store/game'

import logo from '../../assets/img/logo.svg';

import { socket } from '../../socket';

import Modal from '../Modal';
import { Loading } from '../Loading';

export function Navbar() {
  const inGameBallsCount = useGameStore((state: any) => state.gamesRunning)
  const currentBalance = useAuthStore((state: any) => state.wallet.balance)
  const setBalance = useAuthStore(state => state.setBalance)
  const authUser = useAuthStore((state: any) => state.user);
  const [ isModal, setIsModal ] = useState(false);
  const [ isRefunding, setIsRefunding] = useState(false);
  const [ isTest, setIsTest ] = useState(false);

  const onRefund = () => {
    if(!inGameBallsCount){
      if(currentBalance !== 0){
        setIsModal(true)
      }
    }
  }

  const runRefund = () => {
    socket.emit('refund', {
      userId: authUser.id
    })

    setIsRefunding(true);
  }

  const refundModal = () => {
    return (
      <div className="w-full rounded-md bg-secondary px-[15px] sm:px-[30px] py-[20px]">
        <h2 className="text-center text-[28px]">Reback credits</h2>
        <div className="text-center mt-[20px] text-[18px]">{isRefunding ? <Loading /> : <>If you click 'YES', you will return to the home page</>}</div>
        <div className="text-center mt-[30px]">
          <button className="mx-[10px] sm:mx-[20px] px-[30px] py-0 text-[18px] font-bold rounded-sm bg-white text-purple active:translate-y-[2px]" onClick = {runRefund}>Yes</button>
          <button className="mx-[10px] sm:mx-[20px] px-[35px] py-0 text-[18px] font-bold rounded-sm bg-white text-black active:translate-y-[2px]" onClick = {() => { setIsModal(false); setIsRefunding(false); }}>No</button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    if(authUser.id.includes('test' && authUser.name.includes('test'))){
      setIsTest(true);
    } else {
      setIsTest(false);
    }
  }, [authUser])

  useEffect(() => {
    socket.on('refund', (data: any) => {
      if(data.status){
        setBalance(data.balance);
      }
        
      setIsRefunding(false);
      window.location.href = 'https://induswin.com/#/';
      setIsModal(false);
    })

    return () => {
      socket.off('refund');
    }
  }, [])

  return (
    <>
      <nav className="sticky top-0 z-50 bg-primary px-[16px] shadow-lg min-h-[60px]">
        <div
          className={classNames(
            'mx-auto flex h-16 w-full max-w-[1100px] items-center','justify-between'
          )}
        >
          <Link to={inGameBallsCount ? '#!' : '/'} className='text-white text-[32px]'>
            <img src={logo} alt="logo" style={{height: '60px'}} />
          </Link>
          <div className="flex items-center justify-center gap-[4px] font-bold uppercase text-white md:text-lg x-nav">
            <button className="relative mr-[5px] sm:mr-[20px] flex items-center gap-[2px] text-[35px] text-purple hover:text-fuchsia-400" onClick={onRefund}>{!!inGameBallsCount ? <Loading size={30} /> : ""}<span className="text-[16px] sm:text-[20px] text-text flex items-center">Reback</span></button>
            <span className="w-[30px] h-[30px] rounded-full bg-purpleDark p-[4px] text-[24px] flex items-center justify-center">
              <CurrencyInr weight="bold" />
            </span>
            <span className="text-[16px] sm:text-[24px]">{currentBalance.toFixed(2)}</span>
          </div>
        </div>
      </nav>
      { isModal && <Modal data={refundModal} />}
    </>
  )
}
