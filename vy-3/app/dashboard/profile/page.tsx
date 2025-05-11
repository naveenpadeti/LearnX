"use client";
import React, { useContext, useEffect, useState } from 'react';
import {
    Mail,
    Book,
    Calendar,
    Activity,
    Target,
    BookOpen,
    LineChart,
    BadgeCheck,
    Globe,
    Medal,
    Users,
    Clock,
    MessageSquare,
    HelpCircle,
    ThumbsUp,
    SendIcon
} from 'lucide-react';
import Image from "next/image";
import { AppContext } from "@/context/AppContext";
import Link from "next/link";

const ProfilePage = () => {
    const { data, courses, enrollments, fetchCourses } = useContext(AppContext) || {};
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (fetchCourses) {
            fetchCourses().finally(() => setIsLoading(false));
        } else {
            setIsLoading(false);
        }
    }, [fetchCourses]);

    const year = data?.createdAt ? new Date(data.createdAt).getFullYear().toString() : "N/A";

    const enrolledCourses = courses?.filter(course =>
        enrollments?.some(e => e.courseId === course.id && e.studentId === data?.id)
    ) || [];

    const currentCourses = enrolledCourses.map(course => {
        return {
            name: course.title,
            deadline: "Ongoing",
            id: course.id
        };
    });

    if (isLoading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="flex space-x-2">
                        <div className="w-4 h-4 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-4 h-4 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-4 h-4 bg-green-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <p className="text-green-600 font-medium">Loading profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-green-50">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-green-800">My Profile</h1>
                        <p className="text-gray-500 mt-1">Club Points:
                            <span className="font-medium text-green-700 ml-1">{data?.silPoints || 0}</span>
                            <span className="text-gray-400">/1000</span>
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                    {/* Left Column - Profile Info */}
                    <div className="space-y-4 md:space-y-6">
                        {/* Profile Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex flex-col items-center">
                                <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-green-200 shadow-md">
                                    <Image
                                        src={data?.image || '/assets/profile_img2.png'}
                                        alt={`${data?.name || 'Student'}'s profile`}
                                        width={96}
                                        height={96}
                                        className="rounded-full object-cover w-full h-full"
                                        unoptimized
                                    />
                                </div>
                                <h2 className="text-2xl font-bold text-green-800">{data?.name || "Student"}</h2>
                                <p className="text-gray-500 mb-2">{data?.role || "Student"}</p>

                                <div className="w-full mt-4 space-y-3">
                                    <div className="flex items-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-all duration-300">
                                        <Mail className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm truncate">{data?.email}</span>
                                    </div>
                                    <div className="flex items-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-all duration-300">
                                        <Book className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">{data?.branch?.toUpperCase() || "Not specified"}</span>
                                    </div>
                                    <div className="flex items-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-all duration-300">
                                        <Calendar className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                        <span className="text-gray-700 text-sm">Joined {year}</span>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/profile/update"
                                    className="mt-5 py-2.5 px-5 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-medium transition-all hover:shadow-md hover:from-green-700 hover:to-green-600 w-full text-center"
                                >
                                    Update Profile
                                </Link>
                            </div>
                        </div>

                        {/* Progress Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <Target className="w-5 h-5 mr-2 text-green-500" />
                                <h3 className="text-lg font-semibold text-green-800">Club Engagement</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-green-800 font-medium">{data?.silPoints || 0} Points</span>
                                    <span className="text-gray-500">1000 Target</span>
                                </div>
                                <div className="h-2.5 bg-green-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(((data?.silPoints || 0) / 1000) * 100, 100)}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                    {1000 - (data?.silPoints || 0) > 0
                                        ? `${1000 - (data?.silPoints || 0)} more points until next level`
                                        : "Target achieved!"
                                    }
                                </p>
                            </div>
                        </div>

                        {/* Upcoming Events Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <Clock className="w-5 h-5 mr-2 text-green-500" />
                                <h3 className="text-lg font-semibold text-green-800">Upcoming Events</h3>
                            </div>
                            <div className="text-center py-6 px-2">
                                <p className="text-gray-500 mb-3">Club events coming soon!</p>
                                <Link
                                    href="/dashboard/clubs"
                                    className="text-green-600 hover:text-green-700 font-medium flex items-center justify-center group"
                                >
                                    <span>Check Clubs Page</span>
                                    <span className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Feedback & Support Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex items-center mb-4">
                                <MessageSquare className="w-5 h-5 mr-2 text-green-500" />
                                <h3 className="text-lg font-semibold text-green-800">Feedback & Support</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                                    <ThumbsUp className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-green-700 mb-1">Share Your Experience</h4>
                                        <p className="text-sm text-gray-600">Help us improve by sharing your thoughts on courses and features.</p>
                                    </div>
                                </div>
                                <div className="flex items-start p-3 bg-green-50 rounded-lg">
                                    <HelpCircle className="w-5 h-5 mr-3 text-green-500 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-medium text-green-700 mb-1">Need Help?</h4>
                                        <p className="text-sm text-gray-600">Contact support or report any issues you encounter.</p>
                                    </div>
                                </div>
                                <Link
                                    href="/dashboard/profile/feedback"
                                    className="mt-2 py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-all flex items-center justify-center"
                                >
                                    <SendIcon className="w-4 h-4 mr-2" />
                                    Submit Feedback
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Right Column */}
                    <div className="lg:col-span-2 space-y-4 md:space-y-6">
                        {/* Active Courses Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center">
                                    <BookOpen className="w-6 h-6 mr-2 text-green-500" />
                                    <h2 className="text-xl font-bold text-green-800">Enrolled Courses</h2>
                                </div>
                                <span className="text-gray-500 text-sm bg-gray-100 px-2 py-1 rounded-full">Current Term</span>
                            </div>
                            {currentCourses.length > 0 ? (
                                <div className="space-y-3">
                                    {currentCourses.map((course, index) => (
                                        <Link key={index} href={`/dashboard/courses/${course.id}`}>
                                            <div className="bg-green-50 rounded-lg p-4 group hover:bg-green-100 transition-all duration-300 border border-transparent hover:border-green-200">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="text-green-800 font-medium group-hover:text-green-900">{course.name}</h3>
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium group-hover:bg-green-200">
                                                        {course.deadline}
                                                    </span>
                                                </div>
                                                <div className="mt-2 flex items-center text-sm text-gray-600">
                                                    <BookOpen className="w-4 h-4 mr-2 text-green-500" />
                                                    <span>Click to view course details</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 bg-green-50 rounded-lg">
                                    <BookOpen className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                    <p className="text-gray-600 mb-3">You are not enrolled in any courses yet.</p>
                                    <Link
                                        href="/dashboard/courses"
                                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Browse Courses
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-2">
                                    <LineChart className="w-5 h-5 mr-2 text-green-500" />
                                    <span className="text-gray-500">Rating</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-green-800">{data?.cgpa || "N/A"}</div>
                                <p className="text-xs text-gray-500 mt-1">Academic performance</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-2">
                                    <Activity className="w-5 h-5 mr-2 text-green-500" />
                                    <span className="text-gray-500">Total Points</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-green-800">{data?.silPoints || 0}</div>
                                <p className="text-xs text-gray-500 mt-1">Club engagement score</p>
                            </div>
                            <div className="bg-white rounded-xl p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                                <div className="flex items-center mb-2">
                                    <BadgeCheck className="w-5 h-5 mr-2 text-green-500" />
                                    <span className="text-gray-500">Courses</span>
                                </div>
                                <div className="text-2xl md:text-3xl font-bold text-green-800">{currentCourses.length}</div>
                                <p className="text-xs text-gray-500 mt-1">Currently enrolled</p>
                            </div>
                        </div>

                        {/* Club Engagements Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <div className="flex justify-between items-center mb-5">
                                <div className="flex items-center">
                                    <Globe className="w-6 h-6 mr-2 text-green-500" />
                                    <h2 className="text-xl font-bold text-green-800">My Clubs</h2>
                                </div>
                            </div>
                            <div className="text-center py-8 bg-green-50 rounded-lg">
                                <Users className="w-12 h-12 text-green-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-green-800 mb-2">Clubs Coming Soon</h3>
                                <p className="text-gray-600 max-w-md mx-auto mb-4">
                                    Soon you'll be able to join interest groups and participate in club activities.
                                </p>
                                <Link
                                    href="/dashboard/clubs"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center"
                                >
                                    <span>Learn More</span>
                                    <span className="ml-1 transform transition-transform duration-300 group-hover:translate-x-1">→</span>
                                </Link>
                            </div>
                        </div>

                        {/* Badges Card */}
                        <div className="bg-white rounded-xl p-5 md:p-6 shadow-md border border-green-100 hover:shadow-lg transition-shadow duration-300">
                            <h2 className="text-xl font-bold text-green-800 mb-5 flex items-center">
                                <Medal className="w-6 h-6 mr-2 text-green-500" />
                                Club Badges
                            </h2>
                            <div className="text-center py-8 bg-green-50 rounded-lg">
                                <Medal className="w-12 h-12 text-green-300 mx-auto mb-3" />
                                <p className="text-gray-600 mb-1">Earn badges by participating in club activities and events.</p>
                                <p className="text-green-600 font-medium mt-2">Coming Soon!</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;