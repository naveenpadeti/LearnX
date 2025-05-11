"use client"
import React, { useContext, useState, useEffect } from 'react';
import { InstructorContext } from "@/context/InstructorContext";
import axios from "axios";
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, Search } from 'lucide-react';

interface Course {
    id: string;
    title: string;
    description?: string;
}

interface Quiz {
    id: string;
    title: string;
    topic: string;
    type: string;
    difficultyLevel: string;
    questions?: Array<any>;
}

const QuizPage = () => {
    const { courses, backendUrl, instructorToken } = useContext(InstructorContext) || {};
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        if (selectedCourse) {
            fetchQuizzes(selectedCourse.id);
        }
    }, [selectedCourse]);

    const fetchQuizzes = async (courseId: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${backendUrl}/ins/quiz/course/${courseId}`, {
                headers: { token: instructorToken }
            });
            setQuizzes(response.data?.quizzes || []);
        } catch (error) {
            console.error("Error fetching quizzes:", error);
            setError("Failed to load quizzes. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const navigateToQuizDetail = (quizId: string) => {
        router.push(`/instructor/dashboard/quiz/${quizId}`);
    };

    const navigateToCreateQuiz = () => {
        router.push('/instructor/dashboard/quiz/create');
    };

    const filteredQuizzes = searchQuery
        ? quizzes.filter(quiz =>
            quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quiz.topic.toLowerCase().includes(searchQuery.toLowerCase()))
        : quizzes;

    const getDifficultyColor = (level: string) => {
        switch(level.toUpperCase()) {
            case 'BEGINNER': return 'bg-green-100 text-green-800';
            case 'INTERMEDIATE': return 'bg-yellow-100 text-yellow-800';
            case 'ADVANCED': return 'bg-red-100 text-red-800';
            case 'ALL_LEVELS': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Quiz Management</h1>
                <button
                    onClick={navigateToCreateQuiz}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create New Quiz
                </button>
            </div>

            {/* Course Selection */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <BookOpen size={20} className="text-blue-600" />
                    Select a Course
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.isArray(courses) && courses.map((course: Course) => (
                        <div
                            key={course.id}
                            className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                                selectedCourse?.id === course.id
                                    ? 'bg-blue-50 border-blue-500 shadow-md'
                                    : 'hover:bg-gray-50'
                            }`}
                            onClick={() => setSelectedCourse(course)}
                        >
                            <h3 className="font-medium text-lg">{course.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                                {course.description
                                    ? course.description.substring(0, 100) + (course.description.length > 100 ? '...' : '')
                                    : 'No description available'}
                            </p>
                        </div>
                    ))}

                    {Array.isArray(courses) && courses.length === 0 && (
                        <p className="col-span-3 text-gray-500 text-center p-4">
                            No courses available. Create a course first.
                        </p>
                    )}
                </div>
            </div>

            {/* Quizzes List */}
            {selectedCourse && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold">
                            Quizzes for "{selectedCourse.title}"
                        </h2>

                        <div className="relative w-64">
                            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search quizzes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 rounded-md border border-red-200 my-4">
                            {error}
                        </div>
                    )}

                    {!isLoading && !error && quizzes.length === 0 && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg">
                            <p className="text-gray-500 mb-4">No quizzes found for this course.</p>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                onClick={() => router.push('/instructor/dashboard/quiz/create')}
                            >
                                <Plus size={18} />
                                Create First Quiz
                            </button>
                        </div>
                    )}

                    {!isLoading && !error && filteredQuizzes.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredQuizzes.map((quiz: Quiz) => (
                                <div
                                    key={quiz.id}
                                    className="p-5 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors hover:shadow-md"
                                    onClick={() => navigateToQuizDetail(quiz.id)}
                                >
                                    <h3 className="font-medium text-lg mb-2">{quiz.title}</h3>
                                    <p className="text-sm text-gray-600 mb-3">{quiz.topic}</p>
                                    <div className="flex justify-between mb-3">
                                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                            {quiz.type?.replace(/_/g, ' ') || 'Unknown type'}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(quiz.difficultyLevel)}`}>
                                            {quiz.difficultyLevel || 'Unspecified'}
                                        </span>
                                    </div>
                                    <div className="text-xs text-gray-500 flex items-center justify-between border-t pt-2 mt-2">
                                        <span>{quiz.questions?.length || 0} questions</span>
                                        <span className="text-blue-600">View details →</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!isLoading && !error && quizzes.length > 0 && filteredQuizzes.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No quizzes match your search criteria.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizPage;