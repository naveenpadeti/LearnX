"use client";
import React, {useState, useEffect, useContext} from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Book, Users, ClipboardCheck, Settings, LogOut, ChevronRight } from "lucide-react";
import {MentorContext} from "@/context/MentorContext";

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        if (pathname === "/mentor/dashboard") {
            router.push("/mentor/dashboard");
        }
    }, [pathname, router]);
    const context = useContext(MentorContext);
    const logout = context?.mentorLogout;
    const navItems = [
        { name: "Overview", Icon: Book, href: "/mentor/dashboard" },
        { name: "Manage Courses", Icon: Book, href: "/mentor/dashboard/manage" },
        { name: "User Profiles", Icon: Users, href: "/mentor/dashboard/userProfiles" },
        { name: "Mentoring Students", Icon: ClipboardCheck, href: "/mentor/dashboard/students" },
        { name: "Review & Assign Grades", Icon: ClipboardCheck, href: "/mentor/dashboard/grades" },
        { name: "Settings", Icon: Settings, href: "/mentor/dashboard/settings" }
    ];

    return (
        <aside
            className={`fixed left-4 top-4 bottom-4 ${isCollapsed ? 'w-20' : 'w-64'}
                bg-gray-800 text-white border border-gray-700/30
                flex flex-col p-4 shadow-lg rounded-xl
                transition-all duration-300 ease-in-out`}
        >
            <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center justify-between'} mb-8`}>
                <Link href="/mentor/dashboard" className="block" aria-label="Go to overview">
                    <div className={`relative ${isCollapsed ? 'w-10 h-10' : 'w-16 h-16'} transition-all duration-300`}>
                        <Image
                            src="/logo.png"
                            alt="Lurnex logo"
                            width={isCollapsed ? 40 : 64}
                            height={isCollapsed ? 40 : 64}
                            className="object-contain"
                        />
                    </div>
                </Link>
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={`p-2 rounded-lg hover:bg-gray-700 transition-colors
                        ${isCollapsed ? 'mt-4' : ''}`}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronRight
                        size={20}
                        className={`text-white/70 transition-transform duration-300
                            ${isCollapsed ? 'rotate-180' : ''}`}
                    />
                </button>
            </div>

            <nav className="flex-1">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg
                                        ${isCollapsed ? 'px-3 justify-center py-5' : 'px-4'} py-3
                                        transition-all duration-200 group relative
                                        ${isActive
                                        ? "bg-gray-700 text-white"
                                        : "hover:bg-gray-700/80"}`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    <item.Icon
                                        size={22}
                                        className={`flex-shrink-0
                                            transition-transform duration-200
                                            ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}
                                    />
                                    {!isCollapsed && (
                                        <span className="text-sm font-medium">
                                            {item.name}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            <div className="mt-auto pt-6 border-t border-gray-700/50">
                <Link href="/mentor/dashboard/profile" aria-label="View profile">
                    <div
                        className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2 rounded-lg
                        hover:bg-gray-700 transition-all duration-200 mb-4 group`}
                        aria-label="View profile"
                    >
                        <div className="relative">
                            <Image
                                src="/assets/profile_img2.png"
                                alt=""
                                width={36}
                                height={36}
                                className="rounded-full object-cover ring-2 ring-gray-400/20
                                transition-transform duration-200 group-hover:scale-105"
                            />
                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-gray-800"></span>
                        </div>
                        {!isCollapsed && (
                            <div className="overflow-hidden">
                                <p className="text-sm font-semibold truncate">Mentor Name</p>
                                <p className="text-xs text-white/70 truncate">Mentor</p>
                            </div>
                        )}
                    </div>
                </Link>
                <button
                    onClick={() => logout ? logout() : null}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} rounded-lg p-3
                        hover:bg-gray-700 transition-all duration-200 text-sm font-medium
                        group`}
                    aria-label="Logout"
                >
                    <LogOut size={20} className="text-white/80 group-hover:text-white
                        transition-colors duration-200" />
                    {!isCollapsed && (
                        <span>Logout</span>
                    )}
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;