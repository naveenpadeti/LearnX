"use client"
import MentorContextProvider from "@/context/MentorContext";
import {ReactNode} from "react";

export default function MentorProviders({ children }: {
    children: ReactNode;
}) {
    return (
        <MentorContextProvider>
            {children}
        </MentorContextProvider>
    )
}