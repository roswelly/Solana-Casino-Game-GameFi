import React from 'react';
import './modal.scss';

interface IProps {
  open: boolean;
  setOpen: Function;
  className?: string;
  children: any;
}

const Modal = (props: IProps) => {
  const Close = () => {
    props?.setOpen(false);
  };

  return (
    <>
      {props?.open && (
        <div className="modal">
          <div className="overly" onClick={Close} />
          <div className="modal-container">
            <div className="modal-main">{props?.children}</div>
          </div>
        </div>
      )}
    </>
  );
};
export default Modal;
