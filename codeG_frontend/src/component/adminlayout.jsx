import React from 'react';
import { Outlet } from 'react-router';
import Nav_bar from "./navbar";

export default function AdminLayout(){
    
    return (
        <>
        <Nav_bar></Nav_bar>
        <main>
        
        <Outlet></Outlet>
        </main>
        </>
    )
}