import React from 'react';
import './profitbox.scss';

const ProfitBox = ({ self, value, turboMode, playStatus, currentProfit, currentProfitInd, profitCalcPage }: any) => {
  return (
    <div className="history-item">
      <div
        className={
          (turboMode && currentProfitInd === self) || (currentProfitInd - 1 === self && playStatus)
            ? `_active ${currentProfit >= 10 ? '_win3' : currentProfit >= 2 ? '_win2' : '_win1'}`
            : ''
        }
      >
        <span
          className={currentProfit >= 10 ? 'text-yellow' : currentProfit >= 2 ? 'text-green' : 'text-blue'}
        >{`X${value}`}</span>
      </div>
    </div>
  );
};

export default ProfitBox;
