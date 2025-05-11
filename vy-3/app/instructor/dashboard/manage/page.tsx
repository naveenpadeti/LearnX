"use client"
import React, { useContext, useEffect, useState } from 'react';
import { InstructorContext } from '@/context/InstructorContext';
import Image from 'next/image';
import Link from 'next/link';
import { Search, PlusCircle, BookOpen, AlertCircle, Trash2, Edit3, Tag, Clock, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { Course } from "@/context/InstructorContext";
import axios from 'axios';

const courseTypeLabels: Record<string, string> = {
    'IIE': 'Industry Integrated',
    'TEC': 'Technical Education',
    'ESO': 'Essential Skills',
    'LCH': 'Career Help',
    'HWB': 'Health & Wellbeing'
};

type PaginationMetadata = {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
}

const ManageCoursesPage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [courses, setCourses] = useState<Course[]>([]);
    const [pagination, setPagination] = useState<PaginationMetadata>({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 6
    });

    const context = useContext(InstructorContext);
    const backendUrl = context?.backendUrl || '';
    const instructorToken = context?.instructorToken;

    const fetchCourses = async () => {
        if (!instructorToken || !backendUrl) return;

        setIsLoading(true);
        setError('');

        try {
            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '6'); // Match coursesPerPage

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await axios.get(`${backendUrl}/ins/getInstructorCourses?${params.toString()}`, {
                headers: { token: instructorToken }
            });

            setCourses(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching courses:', error);
            setError('Failed to load courses. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [instructorToken, currentPage, filter]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1); // Reset to page 1 when search changes
            } else {
                fetchCourses(); // If already on page 1, just fetch
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleDeleteCourse = async (courseId: string) => {
        if (confirm('Are you sure you want to delete this course?')) {
            setIsDeleting(courseId);
            setError('');

            try {
                // Check if token and backendUrl exist before making the request
                if (!instructorToken || !backendUrl) {
                    throw new Error('Authentication information is missing. Please log in again.');
                }

                const response = await axios.delete(
                    `${backendUrl}/ins/deleteCourse/${courseId}`,
                    {
                        headers: {
                            token: instructorToken
                        }
                    }
                );

                // Check if response indicates success
                if (response.status === 200) {
                    fetchCourses();
                } else {
                    throw new Error('Server returned an unexpected response.');
                }
            } catch (error: any) {
                console.error('Error deleting course:', error);

                // Display more specific error messages
                if (error.response) {
                    // Server responded with an error status
                    setError(`Failed to delete course: ${error.response.data?.message || error.response.statusText}`);
                } else if (error.request) {
                    // Request was made but no response received
                    setError('Server did not respond. Please check your connection and try again.');
                } else {
                    // Error in setting up the request
                    setError(`Failed to delete course: ${error.message}`);
                }
            } finally {
                setIsDeleting(null);
            }
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilter('all');
        setCurrentPage(1);
    };

    if (!context) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">My Courses</h1>
                <p className="text-gray-600">Manage and organize your course content</p>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-auto flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="bg-white border border-gray-300 rounded-lg flex overflow-hidden">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter('published')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'published' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setFilter('draft')}
                            className={`px-4 py-2 text-sm font-medium ${filter === 'draft' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                        >
                            Draft
                        </button>
                    </div>

                    <Link
                        href="/instructor/dashboard/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-6 rounded-lg transition-all duration-200 shadow-sm flex items-center whitespace-nowrap"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        New Course
                    </Link>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    {error}
                </div>
            )}

            {isLoading && courses.length === 0 ? (
                <div className="flex justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : courses.length === 0 && pagination.totalCount === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-xl shadow-sm min-h-[350px] border border-gray-200">
                    <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                        <BookOpen className="h-16 w-16 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Courses Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                        You haven't created any courses yet. Start by creating your first course.
                    </p>
                    <Link
                        href="/instructor/dashboard/create"
                        className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-8 rounded-lg transition-all duration-200 flex items-center shadow-md hover:shadow-lg"
                    >
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Create Your First Course
                    </Link>
                </div>
            ) : courses.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map(course => (
                            <div key={course.id} className="rounded-xl overflow-hidden shadow-md flex flex-col bg-white border border-gray-200 h-full transition-all hover:shadow-lg hover:-translate-y-1 duration-200">
                                <div className="w-full aspect-video relative">
                                    <Image
                                        src={course.image || '/placeholder-course.jpg'}
                                        alt={course.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                            course.isApproved ? "bg-green-500 text-white" : "bg-yellow-400 text-gray-800"
                                        }`}>
                                            {course.isApproved ? "Published" : "Draft"}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-5 flex-grow flex flex-col">
                                    <div className="flex justify-between items-start mb-1">
                                        <h2 className="text-xl font-semibold line-clamp-1">{course.title}</h2>
                                        {course.type && (
                                            <span className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                                                <Tag className="w-3 h-3 mr-1" />
                                                {courseTypeLabels[course.type] || course.type}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2 mb-2">
                                        {course.duration && (
                                            <span className="inline-flex items-center text-xs text-gray-600">
                                                <Clock className="w-3 h-3 mr-1" />
                                                {course.duration}
                                            </span>
                                        )}
                                        {course.difficulty && (
                                            <span className="inline-flex items-center text-xs text-gray-600 ml-2">
                                                <Users className="w-3 h-3 mr-1" />
                                                {course.difficulty.replace('_', ' ').toLowerCase()
                                                    .replace(/\b\w/g, char => char.toUpperCase())}
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 mb-5 line-clamp-2 flex-grow">{course.description}</p>

                                    <div className="grid grid-cols-2 gap-3 mt-2">
                                        <Link
                                            href={`/instructor/dashboard/manage/${course.id}`}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg transition-colors font-medium"
                                        >
                                            <Edit3 className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="flex items-center justify-center gap-1.5 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                                            disabled={isDeleting === course.id}
                                        >
                                            {isDeleting === course.id ? (
                                                <div className="animate-spin h-4 w-4 border-2 border-red-700 border-t-transparent rounded-full"></div>
                                            ) : (
                                                <>
                                                    <Trash2 className="w-4 h-4" />
                                                    Delete
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center mt-8">
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <ChevronLeft className="h-5 w-5 mr-1" />
                                    Previous
                                </button>
                                <div className="px-4 py-2 border-l border-r border-gray-300 bg-gray-50">
                                    Page {pagination.currentPage} of {pagination.totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                                    disabled={currentPage === pagination.totalPages}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <ChevronRight className="h-5 w-5 ml-1" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center bg-gray-50 p-8 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No matching courses</h3>
                    <p className="text-gray-600 text-center mb-4">
                        {searchQuery
                            ? "No courses match your search criteria. Try different keywords."
                            : "No courses match your filter settings."}
                    </p>
                    <button
                        onClick={resetFilters}
                        className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                    >
                        Clear filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ManageCoursesPage;