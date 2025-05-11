import '@/styles/globals.css';
import { ReactNode } from 'react';
import { Metadata } from "next";
import AppProviders from "@/app/AppProvider";
import AdminProviders from "@/app/AdminProvider";
import InstructorProviders from "@/app/InstructorProvider";
import MentorProviders from "@/app/MentorProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
export const metadata: Metadata = {
    title: 'LearnX',
    description: 'LMS',
    icons: '/logo.png',
};

export default function Layout({ children }: { children: ReactNode }) {

    return (
        <html lang="en">
        <body>
        <div className="main">
            <div className="gradient"></div>
        </div>
        <main className="app-full">
            <AdminProviders>
                <InstructorProviders>
                    <MentorProviders>
                        <AppProviders>
                            {children}
                            <Analytics />
                            <SpeedInsights/>
                        </AppProviders>
                    </MentorProviders>
                </InstructorProviders>
            </AdminProviders>
        </main>
        </body>
        </html>
    );
}