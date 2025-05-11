"use client";
import React, { useContext, useEffect, useState } from 'react';
import { InstructorContext } from "@/context/InstructorContext";
import { Eye, RefreshCw, Search, ChevronDown, AlertCircle } from 'lucide-react';

const QuizSubmissionsPage = () => {
    const context = useContext(InstructorContext);
    const { quizAttempts, getQuizAttempts, isLoading, instructorToken } = context || {};
    const [selectedQuiz, setSelectedQuiz] = useState<string | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<string | 'all'>('all');
    const [fetchingData, setFetchingData] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        if (getQuizAttempts && !fetchingData) {
            setFetchingData(true);
            getQuizAttempts().finally(() => {
                setFetchingData(false);
            });
        }
    }, [instructorToken]);

    const allAttempts = quizAttempts ?
        Object.values(quizAttempts).flat() :
        [];

    const filteredAttempts = allAttempts.filter(attempt => {
        const quizMatch = selectedQuiz === 'all' || attempt.quizId === selectedQuiz;
        const statusMatch = statusFilter === 'all' || attempt.status === statusFilter;
        const searchMatch = searchQuery === '' ||
            attempt.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            attempt.quizId.toLowerCase().includes(searchQuery.toLowerCase());
        return quizMatch && statusMatch && searchMatch;
    });

    const totalPages = Math.ceil(filteredAttempts.length / itemsPerPage);
    const paginatedAttempts = filteredAttempts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const quizIds = quizAttempts ? Object.keys(quizAttempts) : [];

    const formatDate = (date: Date | string | null) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return 'Invalid Date';
        }
    };

    const getStatusColorClass = (status: string | undefined) => {
        if (!status) return 'bg-gray-100 text-gray-800 border-gray-200';

        switch (status) {
            case 'COMPLETED':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'IN_PROGRESS':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ABANDONED':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading && allAttempts.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <span className="text-lg font-medium text-gray-700">Loading quiz submissions...</span>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Quiz Submissions</h1>
                <button
                    onClick={() => {
                        if (getQuizAttempts) {
                            setFetchingData(true);
                            getQuizAttempts().finally(() => setFetchingData(false));
                        }
                    }}
                    className="bg-white border border-gray-300 px-4 py-2 rounded-lg shadow-sm hover:bg-gray-50 text-gray-700 font-medium flex items-center transition-colors"
                    disabled={fetchingData}
                >
                    <RefreshCw className={`h-4 w-4 mr-2 ${fetchingData ? 'animate-spin' : ''}`} />
                    {fetchingData ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </div>

            {/* Filters Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="quizFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Quiz
                        </label>
                        <div className="relative">
                            <select
                                id="quizFilter"
                                className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={selectedQuiz}
                                onChange={(e) => setSelectedQuiz(e.target.value)}
                            >
                                <option value="all">All Quizzes</option>
                                {quizIds.map(id => (
                                    <option key={id} value={id}>Quiz {id}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
                            Status
                        </label>
                        <div className="relative">
                            <select
                                id="statusFilter"
                                className="appearance-none w-full bg-white border border-gray-300 rounded-lg py-2.5 px-4 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ABANDONED">Abandoned</option>
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <ChevronDown className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="searchQuery" className="block text-sm font-medium text-gray-700 mb-1">
                            Search
                        </label>
                        <div className="relative">
                            <input
                                id="searchQuery"
                                type="text"
                                placeholder="Search by student or quiz ID"
                                className="w-full border border-gray-300 rounded-lg py-2.5 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-4 w-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Submissions table */}
            {filteredAttempts.length > 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Quiz
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Student
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Started
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Completed
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Score
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {paginatedAttempts.map((attempt) => (
                                <tr key={attempt.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">Quiz {attempt.quizId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{attempt.studentId}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(attempt.startedAt)}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-500">{formatDate(attempt.completedAt)}</div>
                                    </td>

                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {attempt.score !== null ? (
                                            <div className="text-sm font-semibold text-gray-900">{attempt.score}</div>
                                        ) : (
                                            <span className="inline-flex items-center text-xs text-gray-500">
                                                    <AlertCircle className="h-3.5 w-3.5 mr-1" />
                                                    Not graded
                                                </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center p-4 border-t border-gray-200">
                            <div className="flex items-center bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <svg className="h-5 w-5 mr-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M15 19l-7-7 7-7"></path>
                                    </svg>
                                    Previous
                                </button>
                                <div className="px-4 py-2 border-l border-r border-gray-300 bg-gray-50">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <svg className="h-5 w-5 ml-1" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                        <path d="M9 5l7 7-7 7"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <AlertCircle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No quiz submissions found</h3>
                    <p className="text-gray-500 max-w-md mx-auto">
                        {quizIds.length === 0
                            ? "When students complete quizzes, their submissions will appear here."
                            : "Try adjusting your filters to see more results."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default QuizSubmissionsPage;