import React from 'react';
import { HistoryType } from '../../@types';
import classNames from 'classnames';

interface PropsType{
    history: HistoryType[]
}

const BetStatus = ({ history } : PropsType) => {
    return (
        <div className="w-full md:w-[45%] max-w-[350px] sm:max-w-[400px] md:max-w-[550px] lg:max-w-[550px] xl:max-w-[550px] pl-[10px] pr-[10px] xl:pl-[100px] pt-[12px] x-betStatus">
            <div className="flex flex-row justify-start w-full max-w-[400px] gap-[20px] md:gap-0 text-gray-500 text-[20px] overflow-hidden pr-[10px]">
                <div className="w-[30%] max-w-[150px] lg:max-w-[150px]">Player</div>
                <div className="w-[20%] lg:w-[40%] max-w-[120px] lg:max-w-[120px]">Odds</div>
                <div className="w-[25%] lg:w-[20%] max-w-[120px] lg:max-w-[120px]">Bet</div>
                <div className="w-[25%] lg:w-[20%] max-w-[120px] lg:max-w-[120px] text-left">Win</div>
            </div>
            <div className="overflow-auto w-full max-h-[500px] max-w-[400px] sm:max-h-[700px] lg:max-h-[740px] mr-[-20px] pr-[10px]">
                {

                    history.length > 0 ? history.map((ele: HistoryType, ind: number) => (
                        <div key={ind} className="flex flex-row justify-start gap-[20px] md:gap-0 sm:justify-center md:justify-start w-full mt-[15px] text-[14px] text-text border-b-[1px] border-b-slate-700">
                            <div className="w-[30%] max-w-[150px] lg:max-w-[150px]">{ele.username}</div>
                            <div className="w-[20%] lg:w-[40%] max-w-[120px] lg:max-w-[120px]"><span className={classNames("bg-oddbg w-[50px] block text-center rounded-md px-[10px] font-bold text-[14px]", {"text-oddText": ele.odds >= 1, "text-red": ele.odds < 1})}>{ele.odds}</span></div>
                            <div className="w-[25%] lg:w-[20%] max-w-[120px] lg:max-w-[120px]">₹<span className="text-oddText font-normal pl-[2px]">{(ele.betAmount).toFixed(2)}</span></div>
                            <div className="w-[25%] lg:w-[20%] max-w-[120px] lg:max-w-[120px] text-left">₹<span className="text-oddText font-normal pl-[2px]">{(ele.betAmount * Number(ele.odds)).toFixed(2)}</span></div>
                        </div>
                    )) :
                    <div className="flex w-full justify-center max-w-[400px] mt-[10px] text-text">No data</div>
                }
            </div>
        </div>
    )
}

export default BetStatus;