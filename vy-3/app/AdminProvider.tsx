"use client"
import AdminContextProvider from "@/context/AdminContext";
import {ReactNode} from "react";

export default function AdminProviders({ children }: {
    children: ReactNode;
}) {
    return (
        <AdminContextProvider>
            {children}
        </AdminContextProvider>
    )
}