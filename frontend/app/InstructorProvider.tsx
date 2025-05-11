"use client"
import InstructorContextProvider from "@/context/InstructorContext";
import {ReactNode} from "react";

export default function InstructorProviders({ children }: {
    children: ReactNode;
}) {
    return (
        <InstructorContextProvider>
            {children}
        </InstructorContextProvider>
    )
}