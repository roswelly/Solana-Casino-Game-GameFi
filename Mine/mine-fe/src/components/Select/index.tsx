import React, { useEffect } from 'react';
import IconMenu from '../Icons';
import './select.scss';

interface SwitchInterface {
  values?: { key: any; name: string }[];
  selectedKey?: any;
  classname?: string;
  placeholder?: string;
  onChange: Function;
}

const Select = ({ values, selectedKey, classname, placeholder, onChange }: SwitchInterface) => {
  const [status, setStatus] = React.useState({
    selectedKey: selectedKey,
    selectedName: values?.map((item: any) => {
      return item.key === selectedKey && item.name;
    })
  });
  const [dropStatus, setDropStatus] = React.useState(false);

  const panelRef: any = React.useRef(null);

  useEffect(() => {
    setStatus({
      selectedKey: selectedKey,
      selectedName: values?.map((item: any) => {
        return item.key === selectedKey && item.name;
      })
    });
    // eslint-disable-next-line
  }, [selectedKey]);

  return (
    <div
      className="dropdown"
      onClick={() => values?.length !== 0 && (dropStatus ? setDropStatus(false) : setDropStatus(true))}
    >
      {status.selectedKey === '' ? (
        <span className="text-gray/[0.8] font-[400]">{placeholder || 'Select'}</span>
      ) : (
        status.selectedName
      )}
      <div
        className="drop-icon"
        onClick={() => values?.length !== 0 && (dropStatus ? setDropStatus(false) : setDropStatus(true))}
      >
        <IconMenu icon="Dropdown" className={dropStatus ? 'up-rotate' : 'down-rotate'} />
      </div>
      <div className={dropStatus ? 'menu-panel block' : 'menu-panel hidden'} ref={panelRef}>
        <div className="menu-group">
          {values &&
            values.map((item: any, index: number) => {
              return (
                <div
                  key={index}
                  className={classname}
                  onClick={() => {
                    setStatus({
                      selectedKey: item?.key,
                      selectedName: item?.name
                    });
                    onChange({ name: item?.name, key: item?.key });
                  }}
                >
                  {item?.name}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Select;
