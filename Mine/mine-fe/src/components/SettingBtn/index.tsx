import React from 'react';
import './settingbtn.scss';

const SettingBtn = ({ playStatus }: any) => {
  return (
    <div className={`setting-btn ${playStatus ? 'pointer-events-none' : 'cursor-pointer'}`}>
      <div className="setting-btn-container">
        <div className="setting-btn-inner">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default SettingBtn;
