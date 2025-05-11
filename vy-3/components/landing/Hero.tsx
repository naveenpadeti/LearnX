"use client"
import React from 'react';
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const Hero = () => {
    return (
        <section className="pt-16 mt-10 bg-green-50">
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center lg:text-left">
                    <span className="inline-block px-3 py-1 bg-green-200 text-green-900 rounded-full mb-4 text-sm">
                        Join the revolution
                    </span>
                    <h1 className="text-5xl font-extrabold text-green-800 mb-4">
                        Learn, Grow, and Succeed with Us
                    </h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Explore our curated courses designed to help you achieve your goals and unlock your potential.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                        <Link href="/enroll" className="bg-green-700 text-white px-6 py-3 rounded-lg flex items-center shadow-md hover:bg-green-600">
                            Get Started
                            <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                        <Link href="/sign-in" className="border border-green-700 text-green-700 px-6 py-3 rounded-lg shadow-md hover:bg-green-700 hover:text-white">
                            Access Courses
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Hero;