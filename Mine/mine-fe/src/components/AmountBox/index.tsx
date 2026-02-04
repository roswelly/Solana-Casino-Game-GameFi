import React, { useEffect } from 'react';
import './amountbox.scss';

const sub = (a: number, b: number, p = 8) => Math.round((a - b) * 10 ** p) / 10 ** p;
const add = (a: number, b: number, p = 8) => Math.round((a + b) * 10 ** p) / 10 ** p;

const AmountBox = ({ minLimit, maxLimit, value, setValue, playStatus, isMobile, profitAmount }: any) => {
  const handleMax = () => {
    setValue(maxLimit);
  };
  const handleMin = () => {
    setValue(minLimit);
  };
  const handlePlus = () => {
    if (value < 1) return setValue(add(value, 0.1));
    else if (value >= 1 && value < 10) return setValue(add(value, 1));
    else if (value >= 10) return setValue(add(value, 10));
  };
  const handleMinus = () => {
    if (value <= 1) return setValue(sub(value, 0.1));
    else if (value >= 1 && value <= 10) return setValue(sub(value, 1));
    else if (value > 10) return setValue(sub(value, 10));
  };
  useEffect(() => {
    if (value < minLimit) setValue(minLimit);
    else if (value > maxLimit) setValue(maxLimit);
    // eslint-disable-next-line
  }, [value]);

  return (
    <>
      {isMobile === 'desktop' ? (
        <div className={`amount-box ${playStatus && 'pointer-events-none'}`}>
          <div className="amount-landscape">
            <div className="amount-landscape-inner">
              <div className="amount-landscape-center">
                <input type="text" name="amount" value={`₹ ${value}`} readOnly disabled={playStatus} />
              </div>
              <div className="amount-landscape-btn-group">
                <div className="amount-landscape-btn top-left" onClick={handleMax}>
                  <span className={playStatus ? 'text-white/[0.5]' : ''}>max</span>
                </div>
                <div className="amount-landscape-btn top-right" onClick={handlePlus}>
                  <span className={playStatus ? 'text-white/[0.5]' : ''}>+</span>
                </div>
                <div className="amount-landscape-btn bottom-left" onClick={handleMin}>
                  <span className={playStatus ? 'text-white/[0.5]' : ''}>min</span>
                </div>
                <div className="amount-landscape-btn bottom-right" onClick={handleMinus}>
                  <span className={playStatus ? 'text-white/[0.5]' : ''}>-</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isMobile === 'mobile' ? (
        <div className={`mobile-amount-box ${playStatus && 'pointer-events-none'}`}>
          <div className="mobile-amount-controller">
            <div className="mobile-amount-inner">
              {playStatus ?
                <div className="mobile-amount-title">Profit Amount</div> :
                <div className="mobile-amount-title">Bet Amount</div>
              }
              <div className="mobile-amount-btns">
                <div className="mobile-amount-btns-inner">
                  <div className={`btn-left ${playStatus && '!text-white/[0.5]'}`} onClick={handleMin}>
                    min
                  </div>
                  <div className={`btn-right ${playStatus && '!text-white/[0.5]'}`} onClick={handleMinus}>
                    -
                  </div>
                </div>
              </div>
              <div className="mobile-amount-input">
                {playStatus ?
                    <input type="text" name="amount" value={`₹ ${profitAmount>0?(Number(value) * Number(profitAmount)).toFixed(2):value }`} readOnly disabled={playStatus} /> :
                    <input type="text" name="amount" value={`₹ ${value}`} readOnly disabled={playStatus} />
                }
              </div>
              <div className="mobile-amount-btns">
                <div className="mobile-amount-btns-inner">
                  <div className={`btn-left ${playStatus && '!text-white/[0.5]'}`} onClick={handlePlus}>
                    +
                  </div>
                  <div className={`btn-right ${playStatus && '!text-white/[0.5]'}`} onClick={handleMax}>
                    max
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        isMobile === 'modal' && (
          <div className={`modal-amount-box ${playStatus && 'pointer-events-none'}`}>
            <div className="modal-amount-input">
              <input type="text" name="amount" value={`₹ ${value}`} readOnly disabled={playStatus} />
            </div>
            <div className="modal-amount-input-btn" onClick={handleMin}>
              <div className="modal-amount-input-btn-inner">min</div>
            </div>
            <div className="modal-amount-input-btn-group">
              <div className="modal-amount-input-btn-inner">
                <div className="group-btn" onClick={handleMinus}>
                  -
                </div>
                <div className="group-btn" onClick={handlePlus}>
                  +
                </div>
              </div>
            </div>
            <div className="modal-amount-input-btn">
              <div className="modal-amount-input-btn-inner" onClick={handleMax}>
                max
              </div>
            </div>
          </div>
        )
      )}
    </>
  );
};

export default AmountBox;
