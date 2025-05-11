"use client";
import React, { useState, useEffect, useContext } from 'react';
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LogOut, ChevronRight, Globe } from "lucide-react";
import { AppContext } from "@/context/AppContext";

export default function Sidebar() {
    const context = useContext(AppContext);
    const data = context?.data;
    const logout = context?.logout;
    const user = {
        name: data?.name,
        role: data?.role,
        avatar: data?.image || "/assets/profile_img2.png"
    };
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    useEffect(() => {
        if (pathname === "/dashboard") {
            router.push("/dashboard/courses");
        }
    }, [pathname, router]);
    const navItems = [
        { name: "Courses", Icon: BookOpen, href: "/dashboard/courses" }
    ];

    return (
        <aside
            className={`fixed left-4 top-4 bottom-4 ${isCollapsed ? 'w-20' : 'w-64'}
                bg-green-800 text-white border border-green-700/30
                flex flex-col p-4 shadow-lg rounded-xl
                transition-all duration-300 ease-in-out`}
        >
            <div className={`flex ${isCollapsed ? 'flex-col items-center' : 'items-center justify-between'} mb-8`}>
                <Link href="/dashboard/courses" className="block" aria-label="Go to courses">
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
                    className={`p-2 rounded-lg hover:bg-green-700 transition-colors
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
                        const isActive = pathname.startsWith(item.href);

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-lg
                                        ${isCollapsed ? 'px-3 justify-center py-5' : 'px-4'} py-3
                                        transition-all duration-200 group relative
                                        ${isActive
                                        ? "bg-green-700 text-white"
                                        : "hover:bg-green-700/80"}`}
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

            <div className="mt-auto pt-6 border-t border-green-700/50">
                <Link
                    href="/dashboard/profile"
                    className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} p-2 rounded-lg
                        hover:bg-green-700 transition-all duration-200 mb-4 group`}
                    aria-label="View profile"
                >
                    <div className="relative">
                        <Image
                            src={user.avatar}
                            alt=""
                            width={36}
                            height={36}
                            className="rounded-full object-cover ring-2 ring-green-400/20
                                transition-transform duration-200 group-hover:scale-105"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-green-800"></span>
                    </div>
                    {!isCollapsed && (
                        <div className="overflow-hidden">
                            <p className="text-sm font-semibold truncate">{user.name}</p>
                            <p className="text-xs text-white/70 truncate">{user.role}</p>
                        </div>
                    )}
                </Link>

                <button
                    onClick={logout}
                    className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} rounded-lg p-3
                        hover:bg-green-700 transition-all duration-200 text-sm font-medium
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
}