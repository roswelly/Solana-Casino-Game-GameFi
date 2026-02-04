import React from 'react';
import CricketImg from '../../assets/images/cricket.png';
import CricketShadowImg from '../../assets/images/shadow.webp';
import './betbutton.scss';

const BetButton = ({ profitAmount, cardLoading, loading, type, turboMode, isMobile }: any) => {
  console.log(cardLoading, loading);
  return (
    <>
      {isMobile ? (
        <div className={`mobile-bet-button ${(loading || cardLoading) && 'pointer-events-none'}`}>
          <div className={`portrait-container _${type}`}>
            <div className="portrait-inner">
              <div className="portrait-content">
                {loading ? (
                  <div className="loading-container">
                    <img src={CricketShadowImg} alt="shadow" />
                    <div className="btn-loading">
                      <img src={CricketImg} alt="loading..." />
                    </div>
                  </div>
                ) : (
                  <>
                    {type === 'cancel' ? (
                      <span className="bet-button-text">Cancel</span>
                    ) : type === 'cashOut' ? (
                      <span className="bet-button-text">Cash Out</span>
                    ) : (
                      <span className="bet-button-text">{turboMode ? 'Place bet' : 'Start Game'}</span>
                    )}
                    {type === 'cashOut' && (
                      <span className="bet-button-sum">
                        <span>${profitAmount}</span>
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={`bet-button-${type} ${(loading || cardLoading) && 'pointer-events-none'}`}>
          <div className="bet-button-inner">
            <div className="bet-button-content">
              <div className="bet-button-text">
                {loading ? (
                  <div className="loading-container">
                    <img src={CricketShadowImg} alt="shadow" />
                    <div className="btn-loading">
                      <img src={CricketImg} alt="loading..." />
                    </div>
                  </div>
                ) : type === 'cancel' ? (
                  'Cancel'
                ) : type === 'cashOut' ? (
                  'Cash Out'
                ) : (
                  `${turboMode ? 'Place bet' : 'Start Game'}`
                )}
              </div>
              {type === 'cashOut' && (
                <div className="bet-button-sum">
                  <div className="bet-button-sum-content">
                    <span>₹{profitAmount}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BetButton;
