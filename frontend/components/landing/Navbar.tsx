"use client"
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, ChevronDown, User, BookOpen } from "lucide-react";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="fixed top-0 left-0 right-0 flex justify-center z-40">
            <nav className={`w-3/5 mx-auto rounded-full mt-4 transition-all duration-300 ${
                scrolled
                    ? "bg-white shadow-md border border-green-100"
                    : "bg-white/80 backdrop-blur-md border border-green-50"
            }`}>
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-3">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="flex items-center space-x-2">
                                <Image
                                    src="/logo.png"
                                    alt="Lurnex Logo"
                                    width={100}
                                    height={50}
                                    className="h-10 w-auto"
                                />
                            </Link>
                        </div>

                        <div className="hidden md:flex items-center space-x-1">
                            <div className="relative">
                                <button
                                    onClick={toggleDropdown}
                                    className="px-3 py-2 text-green-800 hover:text-green-600 rounded-md transition-colors flex items-center"
                                >
                                    <span>Courses</span>
                                    <ChevronDown size={16} className="ml-1" />
                                </button>

                                {dropdownOpen && (
                                    <div className="absolute top-full right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-green-100 z-50">
                                        <div className="py-1">
                                            <Link href="/courses/programming" className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                                Programming
                                            </Link>
                                            <Link href="/courses/design" className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                                Design
                                            </Link>
                                            <Link href="/courses/business" className="block px-4 py-2 text-sm text-green-700 hover:bg-green-50">
                                                Business
                                            </Link>
                                            <Link href="/courses/all" className="block px-4 py-2 text-sm font-medium text-green-700 border-t border-green-50 hover:bg-green-50">
                                                View All Courses
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/sign-in"
                                className="px-3 py-2 bg-green-600 text-white rounded-md transition-colors flex items-center ml-4"
                            >
                                Sign In
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={toggleMenu}
                                className="p-2 rounded-md text-green-800 hover:bg-green-50 transition-colors"
                                aria-expanded="false"
                            >
                                <span className="sr-only">Open main menu</span>
                                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden bg-white border-t border-green-100 rounded-b-lg">
                        <div className="pt-2 pb-4 space-y-1 px-4">
                            <div>
                                <button
                                    onClick={toggleDropdown}
                                    className="w-full flex items-center justify-between px-3 py-2 text-green-800 hover:bg-green-50 rounded-md"
                                >
                                    <div className="flex items-center">
                                        Courses
                                    </div>
                                    <ChevronDown size={16} />
                                </button>

                                {dropdownOpen && (
                                    <div className="ml-5 mt-1 border-l-2 border-green-100 pl-4 space-y-1">
                                        <Link
                                            href="/courses/programming"
                                            className="block py-2 text-green-700 hover:text-green-500"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Programming
                                        </Link>
                                        <Link
                                            href="/courses/design"
                                            className="block py-2 text-green-700 hover:text-green-500"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Design
                                        </Link>
                                        <Link
                                            href="/courses/business"
                                            className="block py-2 text-green-700 hover:text-green-500"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            Business
                                        </Link>
                                        <Link
                                            href="/courses/all"
                                            className="block py-2 font-medium text-green-700 hover:text-green-500"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            View All Courses
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="/sign-in"
                                className="flex items-center justify-center mt-4"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <User size={16} className="" />
                                Sign In
                            </Link>
                        </div>
                    </div>
                )}
            </nav>
        </div>
    );
};

export default Navbar;