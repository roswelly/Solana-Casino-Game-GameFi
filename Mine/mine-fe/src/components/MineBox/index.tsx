import React from 'react';
import './minebox.scss';

const NumberBox = ({ min, max, value, setValue, playStatus, isMobile }: any) => {
  const dec = () => {
    if (value <= min) return;
    setValue(Number(value) - 1);
  };

  const inc = () => {
    if (value >= max) return;
    setValue(Number(value) + 1);
  };

  const onChange = (e: number) => {
    if (e < min) return;
    if (e > max) return;
    setValue(e);
  };

  return (
    <>
      {isMobile ? (
        <div className={`mobile-mine-box ${playStatus && 'pointer-events-none'}`}>
          <div className="mobile-mine-btns">
            <div className="mobile-mine-btns-inner">
              <div className="wicket-btn" onClick={() => onChange(5)}>
                5
              </div>
              <div className="wicket-btn" onClick={() => onChange(7)}>
                7
              </div>
              <div className="wicket-btn" onClick={() => onChange(10)}>
                10
              </div>
              <div className="wicket-btn" onClick={() => onChange(12)}>
                12
              </div>
            </div>
          </div>
          <div className="mobile-mine-input">
            <div className="input-btn">
              <span className="input-btn-inner" onClick={dec}>
                -
              </span>
            </div>
            <input
              type="number"
              value={value}
              onChange={(e: any) => onChange(e.target.value)}
              disabled={playStatus}
              className={playStatus ? '!text-white/[0.5]' : 'text-white'}
            />
            <div className="input-btn" onClick={inc}>
              <span className="input-btn-inner">+</span>
            </div>
          </div>
        </div>
      ) : (
        <div className={`mine-box ${playStatus && 'pointer-events-none'}`}>
          <div className="mine-box-inner">
            <div className={`mine-box-control-btn ${!playStatus && '_active'}`} onClick={dec}>
              <span>-</span>
            </div>
            <input
              type="number"
              value={value}
              onChange={(e: any) => onChange(e.target.value)}
              disabled={playStatus}
              className={playStatus ? '!text-white/[0.5]' : 'text-white'}
            />
            <div className={`mine-box-control-btn ${!playStatus && '_active'}`} onClick={inc}>
              <span>+</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NumberBox;
