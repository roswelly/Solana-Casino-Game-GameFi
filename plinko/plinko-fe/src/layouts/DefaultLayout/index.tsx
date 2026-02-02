import React from 'react';
import { Outlet } from 'react-router-dom'

import { Navbar } from '../../components/Navbar'

export function DefaultLayout() {    
    return (
        <div className="flex relative min-h-[100vh] w-full flex-col justify-between bg-background">
            <Navbar />
            <div className="flex h-full w-full max-w-[1200px] flex-1 overflow-auto overflow-x-hidden lg:mx-auto">
                <div className="flex-1"><Outlet /></div>
            </div>
        </div>
    )
}
