"use client";
import React, { useContext, useState, useEffect } from 'react';
import { Clock, Book, Search, Filter, Grid, List } from "lucide-react";
import Link from "next/link";
import { AppContext, Course } from "@/context/AppContext";

const CoursesPage = () => {
    const context = useContext(AppContext);
    const [isLoading, setIsLoading] = useState(true);
    const courses = context?.courses || [];
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDifficulty, setFilterDifficulty] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    useEffect(() => {
        if (context) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [context]);

    const courseTypes = Array.from(new Set(courses.map(course => course.type)));
    const difficultyLevels = Array.from(new Set(courses.map(course => course.difficulty)));

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType ? course.type === filterType : true;
        const matchesDifficulty = filterDifficulty ? course.difficulty === filterDifficulty : true;
        return matchesSearch && matchesType && matchesDifficulty && course.isApproved;
    });

    if (isLoading) {
        return <div className="text-center py-10">Loading courses...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-4">Courses</h1>
            <div className="mb-4 flex flex-col md:flex-row gap-4">
                <input
                    type="text"
                    placeholder="Search courses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border rounded px-4 py-2 w-full md:w-auto"
                />
                <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option value="">All Types</option>
                    {courseTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="border rounded px-4 py-2"
                >
                    <option value="">All Levels</option>
                    {difficultyLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
                {(searchTerm || filterType || filterDifficulty) && (
                    <button
                        onClick={() => { setSearchTerm(''); setFilterType(''); setFilterDifficulty(''); }}
                        className="text-red-600 border border-red-300 rounded px-4 py-2"
                    >
                        Clear
                    </button>
                )}
            </div>
            {filteredCourses.length === 0 ? (
                <div className="text-center py-10">No courses found.</div>
            ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                    {filteredCourses.map((course: Course) => (
                        <div key={course.id} className="border rounded p-4">
                            <h3 className="font-bold text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-600">{course.description}</p>
                            <div className="text-sm text-gray-500 mt-2">
                                <div>Type: {course.type}</div>
                                <div>Difficulty: {course.difficulty}</div>
                            </div>
                            <Link
                                href={`/dashboard/courses/${course.id}`}
                                className="block mt-4 text-blue-600 hover:underline"
                            >
                                View Course
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CoursesPage;