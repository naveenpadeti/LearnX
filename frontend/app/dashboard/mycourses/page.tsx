"use client";
import React, { useContext, useState, useEffect } from 'react';
import { Clock, Book, CheckCircle, Award, BookOpen, AlertCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";

const MyCoursesPage = () => {
    const { data, courses, enrollments } = useContext(AppContext) || {};
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'in-progress', 'completed'

    useEffect(() => {
        // Set loading to false after context loads
        if (data && courses) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [data, courses]);

    if (isLoading) {
        return (
            <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gradient-to-br from-blue-50/40 to-indigo-50/40 min-h-screen flex items-center justify-center">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-md border border-white/30 w-full max-w-md">
                    <div className="flex flex-col items-center">
                        <div className="flex space-x-2 mb-4">
                            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                        <p className="text-blue-800 font-medium">Loading your courses...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Get user's enrolled courses
    const userId = data?.id;
    const userEnrollments = enrollments?.filter(enrollment => enrollment.studentId === userId) || [];
    const enrolledCourseIds = userEnrollments.map(enrollment => enrollment.courseId);
    const enrolledCourses = courses?.filter(course => enrolledCourseIds.includes(course.id)) || [];

    // Filter courses based on the selected filter
    const filteredCourses = enrolledCourses.filter(course => {
        const enrollment = userEnrollments.find(e => e.courseId === course.id);
        const progress = enrollment?.progress || 0;

        if (filter === 'in-progress') return progress > 0 && progress < 100;
        if (filter === 'completed') return progress >= 100;
        return true; // 'all' filter
    });

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="mb-4 md:mb-0">
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">My Learning Journey</h1>
                        <p className="text-blue-100">Track your progress and continue your courses</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600/30 rounded-full">
                                <Book className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm opacity-80">Enrolled Courses</p>
                                <p className="text-xl font-semibold">{enrolledCourses.length}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filter === 'all'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    All Courses
                </button>
                <button
                    onClick={() => setFilter('in-progress')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filter === 'in-progress'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    In Progress
                </button>
                <button
                    onClick={() => setFilter('completed')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${
                        filter === 'completed'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    Completed
                </button>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <div className="bg-white rounded-xl p-12 shadow-md border border-gray-200 text-center">
                    <BookOpen className="mx-auto h-16 w-16 mb-4 text-gray-300" />
                    <h3 className="text-xl font-semibold mb-2 text-gray-800">No courses found</h3>
                    <p className="text-gray-600 mb-6">
                        {filter === 'all'
                            ? "You haven't enrolled in any courses yet."
                            : filter === 'in-progress'
                                ? "You don't have any courses in progress."
                                : "You haven't completed any courses yet."}
                    </p>
                    <Link
                        href="/dashboard/courses"
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map(course => {
                        const enrollment = userEnrollments.find(e => e.courseId === course.id);
                        const progress = enrollment?.progress || 0;

                        return (
                            <Link
                                href={`/dashboard/courses/${course.id}`}
                                key={course.id}
                                className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col h-full"
                            >
                                <div className="relative">
                                    <Image
                                        src={course.image || "/api/placeholder/500/300"}
                                        alt={course.title}
                                        width={500}
                                        height={300}
                                        className="w-full h-48 object-cover"
                                    />
                                    {progress >= 100 ? (
                                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-3 py-1 rounded-full flex items-center">
                                            <CheckCircle size={12} className="mr-1" /> Completed
                                        </div>
                                    ) : progress > 0 ? (
                                        <div className="absolute top-3 right-3 bg-yellow-500 text-white text-xs px-3 py-1 rounded-full">
                                            In Progress
                                        </div>
                                    ) : (
                                        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                                            Not Started
                                        </div>
                                    )}
                                </div>

                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="mb-4">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-2">{course.title}</h3>
                                        <p className="text-sm text-gray-600 flex items-center">
                                            by <span className="font-medium ml-1">{course.instructorId}</span>
                                        </p>
                                    </div>

                                    <div className="mt-auto">
                                        <div className="flex justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">Progress</span>
                                            <span className="text-sm font-medium text-blue-600">{progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${
                                                    progress >= 100
                                                        ? 'bg-green-500'
                                                        : 'bg-blue-600'
                                                }`}
                                                style={{ width: `${progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {course.duration}
                                    </div>
                                    <span className="text-blue-700 font-medium text-sm">Continue Learning →</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}

            {filteredCourses.length > 0 && (
                <div className="mt-8 text-center text-sm text-gray-500">
                    <p>
                        Showing {filteredCourses.length} of {enrolledCourses.length} enrolled courses
                    </p>
                </div>
            )}
        </div>
    );
};

export default MyCoursesPage;