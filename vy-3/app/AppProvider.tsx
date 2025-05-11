"use client"

import AppContextProvider from "@/context/AppContext"
import {ReactNode} from "react";

export default function AppProviders({ children }: {
    children: ReactNode;
}) {
    return (
        <AppContextProvider>
            {children}
        </AppContextProvider>
    )
}