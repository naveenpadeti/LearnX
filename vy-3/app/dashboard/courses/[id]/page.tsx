"use client";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { AppContext, Lecture } from "@/context/AppContext";
import { useParams } from "next/navigation";
import Link from "next/link";

const CourseDetailsPage = () => {
    const params = useParams();
    const courseId = params.id as string;
    const { courses, fetchCourses, token } = useContext(AppContext) || {};
    const [isLoading, setIsLoading] = useState(true);
    const courseDetails = courses?.find((course) => course.id === courseId);

    useEffect(() => {
        if (token) {
            setIsLoading(true);
            fetchCourses?.().finally(() => setIsLoading(false));
        }
    }, [token, fetchCourses]);

    if (isLoading) {
        return <div className="text-center py-10">Loading course details...</div>;
    }

    if (!courseDetails) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-bold">Course Not Found</h2>
                <p>The course you're looking for doesn't exist or may have been removed.</p>
                <Link href="/dashboard/courses" className="text-blue-600 hover:underline">
                    Browse Courses
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="border rounded p-4 mb-6">
                <h1 className="text-2xl font-bold mb-2">{courseDetails.title}</h1>
                <p className="text-gray-600 mb-4">{courseDetails.description}</p>
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-sm text-gray-500">Students</p>
                        <p className="font-semibold">{courseDetails.enrollments?.length || 0}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-semibold">{courseDetails.duration}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-500">Difficulty</p>
                        <p className="font-semibold">{courseDetails.difficulty}</p>
                    </div>
                </div>
            </div>

            <div className="border rounded p-4">
                <h2 className="text-lg font-bold mb-4">Course Content</h2>
                {courseDetails.courseContent?.length > 0 ? (
                    <ul className="space-y-2">
                        {courseDetails.courseContent.map((lesson: Lecture, index: number) => (
                            <li key={index} className="p-2 border rounded">
                                {lesson.title}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-600">No lessons available yet.</p>
                )}
            </div>
        </div>
    );
};

export default CourseDetailsPage;