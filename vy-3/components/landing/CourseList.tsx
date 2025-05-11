"use client"
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

const CourseList = () => {
    const courses = [
        {
            id: 1,
            name: "Build a website with HTML, CSS, and JavaScript",
            instructor: "Anvesh Yadav",
            rating: 4.8,
            img: "/assets/course_1.png",
            description: "Learn the fundamentals of web development by building a complete website from scratch."
        },
        {
            id: 2,
            name: "React.js for Beginners: Build Modern Web Apps",
            instructor: "Sarah Johnson",
            rating: 4.9,
            img: "/assets/course_2.png",
            description: "Master React.js and create interactive user interfaces with the most popular JavaScript library."
        },
        {
            id: 3,
            name: "UI/UX Design Masterclass: Create Beautiful Interfaces",
            instructor: "Michael Chen",
            rating: 4.7,
            img: "/assets/course_3.png",
            description: "Learn the principles of UI/UX design and create stunning interfaces that users will love."
        }
    ];

    return (
        <section className="py-16">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-2xl font-bold text-blue-800 mb-8">
                    Top Courses
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(course => (
                        <div key={course.id} className="border bg-white border-blue-100 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative">
                                <Image
                                    src={course.img}
                                    alt={course.name}
                                    width={500}
                                    height={300}
                                    className="w-full h-48 object-cover"
                                />
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-blue-800 mb-1">{course.name}</h3>
                                <p className="text-sm text-gray-600 mb-2">by {course.instructor}</p>
                                <p className="text-sm text-gray-700 mb-4 line-clamp-2">{course.description}</p>

                                <div className="flex justify-between items-center">
                                    <div className="flex items-center">
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    size={14}
                                                    fill={i < Math.floor(course.rating) ? "currentColor" : "none"}
                                                    className="mr-0.5"
                                                />
                                            ))}
                                        </div>
                                        <span className="ml-1 text-xs text-gray-600">{course.rating}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 text-center">
                    <Link href="/sign-in" className="bg-blue-600 text-white px-8 py-3 rounded-lg inline-block hover:bg-blue-700 transition-colors text-lg font-medium">
                        Browse All Courses
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CourseList;