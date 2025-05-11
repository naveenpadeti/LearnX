"use client";
import React, { useContext } from 'react';
import {
    Mail,
    Book,
    Calendar,
    BookOpen,
} from 'lucide-react';
import Image from "next/image";
import Link from "next/link";
import { InstructorContext } from "@/context/InstructorContext";

const InstructorProfilePage = () => {
    const context = useContext(InstructorContext);
    const data = context?.instructorData;
    const year = data?.createdAt.toString().slice(0, 4);
    const instructorData = {
        name: data?.name || "John Doe",
        role: data?.role,
        email: data?.email,
        joinedYear: year,
        department: data?.branch?.toUpperCase() || "Computer Science",
        img: data?.image || '/assets/profile_img2.png',
        currentCourses: data?.createdCourses || []
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-blue-800">My Profile</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-blue-200">
                                    <Image
                                        src={instructorData.img}
                                        alt="Profile"
                                        width={96}
                                        height={96}
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-blue-800">{instructorData.name}</h2>
                                <p className="text-gray-500">{instructorData.role}</p>

                                <div className="w-full mt-6 space-y-3">
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Mail className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{instructorData.email}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Book className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">{instructorData.department}</span>
                                    </div>
                                    <div className="flex items-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-all duration-300">
                                        <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                                        <span className="text-gray-700 text-sm">Joined {instructorData.joinedYear}</span>
                                    </div>
                                </div>
                                <Link href="/instructor/dashboard/profile/update" className="mt-4 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all">
                                    Update Profile
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl p-6 shadow-md border border-blue-100">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <BookOpen className="w-6 h-6 mr-2 text-blue-500" />
                                    <h2 className="text-xl font-bold text-blue-800">Courses Taught</h2>
                                </div>
                                <span className="text-gray-500">Current Term</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default InstructorProfilePage;