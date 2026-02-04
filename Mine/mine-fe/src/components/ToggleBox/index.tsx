import React from 'react';
import './togglebox.scss';

const ToggleBox = ({ value, setValue, playStatus, isMobile }: any) => {
  return (
    <>
      {isMobile ? (
        <div
          className={`mobile-toggle-box ${playStatus && 'pointer-events-none'}`}
          onClick={() => setValue((prev: boolean) => !prev)}
        >
          <div className={`mobile-toggle-box-container ${value && '_active'}`}>
            <div className="mobile-toggle-box-inner">
              <div className="mobile-toggle-box-title">Turbo</div>
              <div className="mobile-toggle-button" />
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`toggle-box ${value && 'toggle-box_active'} ${playStatus && 'pointer-events-none'}`}
          onClick={() => setValue((prev: boolean) => !prev)}
        >
          <div className="toggle-box-inner">
            <div className="toggle-box-btn" />
          </div>
        </div>
      )}
    </>
  );
};

export default ToggleBox;
