import React from 'react';

const Modal = (props: any) => {
    const modalData = props.data();
    return (
        <div className="fixed top-0 left-0 w-screen h-screen z-10 bg-modalbg flex justify-center items-center">
            <div className="w-full h-full flex items-center justify-center max-w-[450px] max-h-[300px] mt-[-50px] sm:mt-[-100px] text-text px-[10px]">{modalData}</div>
        </div>
    )
}

export default Modal