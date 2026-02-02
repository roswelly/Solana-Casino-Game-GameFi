import { ChangeEvent, useState, useRef, useEffect } from 'react'
import { CurrencyInr } from 'phosphor-react'
import classNames from 'classnames'
import { toast } from 'react-toastify'

import { useAuthStore } from '../../store/auth'

import { BetType } from '../../@types'

interface PlinkoBetActions {
  onRunBet: (key: BetType, betValue: number) => void
  inGameBallsCount: number
}

export function BetActions({
  onRunBet,
  inGameBallsCount
}: PlinkoBetActions) {
  const currentBalance = useAuthStore(state => state.wallet.balance)
  const autoIntervalRef = useRef<any>(null);

  const [betValue, setBetValue] = useState({
    easy: '10.00',
    medium: '10.00',
    diff: '10.00'
  })
  const [auto, setAuto] = useState<{ [key: string]: boolean }>({
    easy: false,
    medium: false,
    diff: false
  })
  const [autoBet, setAutoBet] = useState<{betType: BetType, auto: boolean}>({
    betType: 'easy',
    auto: false
  })

  const betActions = ['easy', 'medium', 'diff'] as Array<BetType>

  const updateBetValue = (key: BetType, value: string) => {
    setBetValue({ ...betValue, [key]: value })
  }

  const updateAuto = (key: BetType) => {
    if(!autoBet.auto){
      setAuto({ ...auto, [key]: !auto[key] });
    }
  }

  const updateAutoBet = (key: BetType) => {
    setAutoBet({ betType: key, auto: !autoBet.auto });
  }

  function handleChangeBetValue(key: BetType, e: ChangeEvent<HTMLInputElement>) {
    if(!autoBet.auto){
      e.preventDefault()
      const newBetValue = +e.target.value >= currentBalance ? currentBalance : +e.target.value
      updateBetValue(key, newBetValue.toString());
    }
  }

  function handleDoubleBet(key: BetType) {
    if(!autoBet.auto){
      const value = Number(betValue[key]) * 2

      if (value >= currentBalance) {
        updateBetValue(key, currentBalance.toString())
        return
      }

      const newBetvalue = value <= 0 ? 0 : value.toFixed(2)
      updateBetValue(key, newBetvalue.toString())
    }
  }

  function handleHalfBet(key: BetType) {
    if(!autoBet.auto){
      const value = Number(betValue[key]) / 2
      const newBetvalue = value <= 0 ? 0 : value.toFixed(2)
      updateBetValue(key, newBetvalue.toString())
    }
  }

  async function handleRunBet(key: BetType, isAuto: boolean) {
    // if(autoBet.auto && autoBet.betType !== key) return

    if(isAuto){
      updateAutoBet(key);
    }

    if (Number(betValue[key]) < 10) {
      toast.warn('Minimum bet amount is 10.00');
      return;
    } 

    if (Number(betValue[key]) > currentBalance) {
      updateBetValue(key, currentBalance.toString())
      onRunBet(key, currentBalance)
      return
    }

    onRunBet(key, Number(betValue[key]))
  }

  useEffect(() => {
    if(autoBet.auto){
      autoIntervalRef.current = setInterval(() => {
        if (Number(betValue[autoBet.betType]) > currentBalance) {
          updateBetValue(autoBet.betType, currentBalance.toString())
          return
        }

        onRunBet(autoBet.betType, Number(betValue[autoBet.betType]))
      }, 3000)
    } else{
      if(autoIntervalRef.current){
        setAuto({
          easy: false,
          medium: false,
          diff: false
        })
        clearInterval(autoIntervalRef.current);
        autoIntervalRef.current = null;
      }
    }

    return () => {
      clearInterval(autoIntervalRef.current);
    }
  }, [autoBet])

  return (
    <div className="relative h-1/2 min-w-[396px] w-[65%] sm:w-[75%] md:w-full flex-1 pb-[32px] px-[10px] lg:px-[20px] x-bet-action">
      <div className="flex flex-row justify-between gap-[8px]" >
        {
          betActions.map(ele => (
            <div key={ele} className="flex flex-col basis-1/3 gap-[5px]">
              <div className={classNames("flex h-full flex-col items-stretch w-full rounded-md bg-primary p-[10px] text-sm font-bold md:text-base", {"text-text": !autoBet.auto, "text-whiteDisable": autoBet.auto})} >
                <div className="relative flex justify-start items-center pl-[40%]">
                  <div className="absolute left-[50%] translate-x-[-45px] flex items-center justify-center rounded-full bg-purpleDark w-[25px] h-[25px] p-[2px] text-[24px]">
                    <CurrencyInr weight="bold" />
                  </div>
                  <input className="bg-transparent w-[100px] text-[22px] focus:outline-none" type="number" value={betValue[ele]} onChange={(e: any) => handleChangeBetValue(ele, e)} />
                </div>
                {/* <div className="flex flex-1 justify-center items-center gap-[4px]">
                  <div className="flex items-center justify-center rounded-full bg-purpleDisable w-[20px] h-[20px] p-[2px]">
                    <CurrencyDollarSimple weight="bold" />
                  </div>
                  <span>0.00</span>
                </div> */}
                <div className="flex flex-1 justify-center items-center gap-[4px] text-[18px] mt-[5px]">
                  <span className="mr-[12px] text-sm font-medium text-text">auto</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" value="" checked={auto[ele]} onChange={() => updateAuto(ele)} className="sr-only peer" />
                    <div className={ classNames("w-[44px] h-[24px] bg-secondary rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:border after:rounded-full after:h-[20px] after:w-[20px] after:transition-all", 
                        { "after:bg-white after:border-gray-300": !autoBet.auto, "after:bg-whiteDisable after:border-gray-700 ": autoBet.auto},
                        {"peer-checked:bg-blue": ele === 'easy', "peer-checked:bg-green": ele === 'medium', "peer-checked:bg-red": ele === 'diff'}
                      )}
                    >
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex flex-1 justify-between items-center gap-[4px] text-[18px]">
                <button className="rounded-md bg-primary text-text font-bold px-[20px] py-[3px] x-half-btn" onClick={() => handleHalfBet(ele)}>1/2</button>
                <button className="rounded-md bg-primary text-text font-bold px-[25px] py-[3px] x-double-btn" onClick={() => handleDoubleBet(ele)}>2<span>x</span></button>
              </div>
              <button
                onClick={() => handleRunBet(ele, auto[ele])}
                disabled={false}
                className={classNames("relative block h-[50px] mt-[10px] rounded-md px-[8px] py-[16px] text-sm font-bold leading-none text-background transition-colors",
                  {"bg-blueGrey": ele === 'easy', "bg-greenGrey": ele === 'medium', "bg-redGrey": ele === 'diff'}
                )}
              >
                <span className={classNames("w-full h-[50px] absolute text-text px-[8px] py-[16px] top-[-10px] left-0 rounded-md active:top-[-5px] focus:top-0", 
                  {"text-text": !autoBet.auto, "text-whiteDisable": autoBet.auto && autoBet.betType !== ele},
                  {"bg-blue": ele === 'easy', "bg-green": ele === 'medium', "bg-red": ele === 'diff'}
                )}>
                  {autoBet.betType === ele && autoBet.auto ? "Stop" : "Bet"}
                </span>
              </button>
            </div>
          ))
        }
      </div>
    </div>
  )
}
