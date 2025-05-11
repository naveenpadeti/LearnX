"use client"
import React, { useContext, useState, useEffect } from 'react'
import { AdminContext } from '@/context/AdminContext'
import axios from 'axios'
import Image from 'next/image'
import { Check, Trash2, X, AlertCircle, CheckCircle, ChevronLeft, ChevronRight, Search, BookOpen } from 'lucide-react'

const CoursesPage = () => {
    const adminContext = useContext(AdminContext)
    const [isProcessing, setIsProcessing] = useState<string | null>(null)
    const [isLoadingCourses, setIsLoadingCourses] = useState<boolean>(true)
    const [notification, setNotification] = useState<{
        message: string;
        type: 'success' | 'error';
        visible: boolean;
    }>({ message: '', type: 'success', visible: false })
    const [searchQuery, setSearchQuery] = useState<string>('')
    const [currentPage, setCurrentPage] = useState(1)
    const [coursesPerPage, setCoursesPerPage] = useState(9)
    const courses = adminContext?.courses || []

    useEffect(() => {
        if (adminContext) {
            if (courses.length > 0) {
                setIsLoadingCourses(false)
            } else {
                const timer = setTimeout(() => {
                    setIsLoadingCourses(false)
                }, 800)
                return () => clearTimeout(timer)
            }
        }
    }, [adminContext, courses])

    const showNotification = (message: string, type: 'success' | 'error') => {
        setNotification({ message, type, visible: true })
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }))
        }, 3000)
    }

    const handleVerify = async (courseId: string) => {
        try {
            setIsProcessing(courseId)
            await axios.put(`${adminContext?.backendUrl}/admin/verifyCourse`,
                { courseId },
                {
                    headers: {
                        token: adminContext?.adminToken || ''
                    }
                }
            )

            const updatedCourses = courses.map(course =>
                course.id === courseId ? {...course, isApproved: true} : course
            )
            adminContext?.setCourses(updatedCourses)

            showNotification("Course verified successfully", "success")
        } catch (error) {
            console.error("Failed to verify course:", error)
            showNotification("Failed to verify course", "error")
        } finally {
            setIsProcessing(null)
        }
    }

    const handleDelete = async (courseId: string) => {
        try {
            setIsProcessing(courseId)
            await axios.delete(`${adminContext?.backendUrl}/admin/deleteCourse`, {
                headers: {
                    token: adminContext?.adminToken || ''
                },
                data: { courseId }
            })

            const updatedCourses = courses.filter(course => course.id !== courseId)
            adminContext?.setCourses(updatedCourses)

            showNotification("Course deleted successfully", "success")
        } catch (error) {
            console.error("Failed to delete course:", error)
            showNotification("Failed to delete course", "error")
        } finally {
            setIsProcessing(null)
        }
    }

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const indexOfLastCourse = currentPage * coursesPerPage
    const indexOfFirstCourse = indexOfLastCourse - coursesPerPage
    const currentCourses = filteredCourses.slice(indexOfFirstCourse, indexOfLastCourse)
    const totalPages = Math.ceil(filteredCourses.length / coursesPerPage)

    React.useEffect(() => {
        setCurrentPage(1)
    }, [searchQuery, coursesPerPage])

    const goToPage = (page: number) => {
        if (page > 0 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    if (!adminContext) {
        return (
            <div className="flex items-center justify-center p-8 min-h-[60vh]">
                <div className="text-center">
                    <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading admin data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 max-w-7xl mx-auto">
            {notification.visible && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {notification.type === 'success' ?
                        <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <span className="flex-1">{notification.message}</span>
                    <button
                        onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
                        className="ml-2 p-1 hover:bg-gray-200 rounded-full flex items-center justify-center"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-green-800">Course Management</h1>
                {!isLoadingCourses && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full">
                        {filteredCourses.length} Courses
                    </span>
                )}
            </div>

            <div className="mb-6 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400 h-4 w-4" />
                </div>
                <input
                    type="text"
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-green-200 focus:border-green-400 outline-none transition-all"
                />
            </div>

            {isLoadingCourses ? (
                <div className="flex justify-center items-center p-12 bg-white rounded-lg border border-gray-200 shadow-sm min-h-[300px]">
                    <div className="text-center">
                        <div className="animate-spin h-10 w-10 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-gray-600 font-medium">Loading courses...</p>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {currentCourses.map((course) => (
                            <div key={course.id} className="rounded-xl overflow-hidden shadow-md flex flex-col bg-white border border-gray-200 h-full">
                                <div className="w-full aspect-video relative">
                                    <Image
                                        src={course.image || '/placeholder-course.jpg'}
                                        alt={course.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="object-cover w-full"
                                    />
                                    <div className="absolute top-3 right-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                                            course.isApproved ? "bg-green-500 text-white" : "bg-yellow-400 text-gray-800"
                                        }`}>
                                            {course.isApproved ? "Verified" : "Pending"}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 flex flex-col flex-1">
                                    <h2 className="text-xl font-semibold text-green-800 mb-2 line-clamp-2">{course.title}</h2>

                                    <p className="text-gray-600 mb-5 line-clamp-3 flex-grow">
                                        {course.description}
                                    </p>

                                    <div className="flex gap-3 mt-auto">
                                        {!course.isApproved ? (
                                            <>
                                                <button
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 text-green-700 hover:bg-green-100 rounded-lg transition-colors disabled:opacity-50 flex-1 font-medium"
                                                    onClick={() => handleVerify(course.id)}
                                                    disabled={isProcessing === course.id}
                                                >
                                                    {isProcessing === course.id ? (
                                                        <div className="animate-spin h-5 w-5 border-2 border-green-700 border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <>
                                                            <Check className="w-5 h-5 flex-shrink-0" />
                                                            <span>Verify</span>
                                                        </>
                                                    )}
                                                </button>
                                                <button
                                                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 flex-1 font-medium"
                                                    onClick={() => handleDelete(course.id)}
                                                    disabled={isProcessing === course.id}
                                                >
                                                    {isProcessing === course.id ? (
                                                        <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
                                                    ) : (
                                                        <>
                                                            <Trash2 className="w-5 h-5 flex-shrink-0" />
                                                            <span>Delete</span>
                                                        </>
                                                    )}
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50 w-full font-medium"
                                                onClick={() => handleDelete(course.id)}
                                                disabled={isProcessing === course.id}
                                            >
                                                {isProcessing === course.id ? (
                                                    <div className="animate-spin h-5 w-5 border-2 border-red-700 border-t-transparent rounded-full"></div>
                                                ) : (
                                                    <>
                                                        <Trash2 className="w-5 h-5 flex-shrink-0" />
                                                        <span>Delete Course</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {filteredCourses.length === 0 && (
                            <div className="p-10 text-center bg-green-50 rounded-lg border col-span-full flex flex-col items-center">
                                <BookOpen className="h-12 w-12 text-green-400 mb-4" />
                                <h3 className="text-lg font-medium text-green-800 mb-1">No courses found</h3>
                                <p className="text-gray-500">
                                    {searchQuery
                                        ? "Try adjusting your search to find what you're looking for."
                                        : "No courses are available at the moment."}
                                </p>
                            </div>
                        )}
                    </div>

                    {filteredCourses.length > 0 && (
                        <div className="mt-8 border-t pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Showing {indexOfFirstCourse + 1} to {Math.min(indexOfLastCourse, filteredCourses.length)} of {filteredCourses.length} courses
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => goToPage(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </button>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const startPage = Math.max(1, currentPage - 2);
                                        const page = startPage + i;

                                        if (page <= totalPages) {
                                            return (
                                                <button
                                                    key={page}
                                                    onClick={() => goToPage(page)}
                                                    className={`w-8 h-8 rounded-md ${
                                                        currentPage === page
                                                            ? 'bg-green-600 text-white'
                                                            : 'border border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => goToPage(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </button>

                                    <select
                                        value={coursesPerPage}
                                        onChange={(e) => {
                                            setCoursesPerPage(Number(e.target.value));
                                            setCurrentPage(1);
                                        }}
                                        className="ml-4 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                    >
                                        <option value="6">6 per page</option>
                                        <option value="9">9 per page</option>
                                        <option value="12">12 per page</option>
                                        <option value="15">15 per page</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}
export default CoursesPage