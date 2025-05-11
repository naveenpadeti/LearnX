'use client';
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { InstructorContext } from "@/context/InstructorContext";
import { ChevronLeft, ChevronRight, Search, AlertCircle, Eye, Pencil, Clock, X, CheckCircle } from 'lucide-react';

type Submission = {
    id: string;
    student: {
        id: string;
        name: string;
        email: string;
        image: string;
    };
    assignment: {
        id: string;
        title: string;
        courseId: string;
        maxMarks: number;
        course: {
            id: string;
            title: string;
        }
    };
    submissionUrl: string;
    grade?: number;
    feedback?: string;
    submittedAt: string;
};

type PaginationMetadata = {
    totalCount: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
};


const SubmissionsPage = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
    const [marks, setMarks] = useState<string>('');
    const [feedback, setFeedback] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationMetadata>({
        totalCount: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 10
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const context = useContext(InstructorContext);
    const backendUrl = context?.backendUrl || '';
    const instructorToken = context?.instructorToken;
    const [error, setError] = useState('');

    const fetchSubmissions = async () => {
        if (!instructorToken) return;

        try {
            setLoading(true);
            setError('');

            // Build query parameters
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', pagination.pageSize.toString());

            if (searchQuery) {
                params.append('search', searchQuery);
            }

            if (filter !== 'all') {
                params.append('status', filter);
            }

            const response = await axios.get(`${backendUrl}/ins/getInstructorSubmissions?${params.toString()}`, {
                headers: {
                    token: instructorToken
                }
            });

            setSubmissions(response.data.data);
            setPagination(response.data.pagination);
        } catch (error) {
            console.error('Error fetching submissions:', error);
            setError('Failed to load submissions. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (instructorToken) {
            fetchSubmissions();
        }
    }, [instructorToken, currentPage, filter]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1); // Reset to page 1 when search changes
            } else {
                fetchSubmissions(); // If already on page 1, just fetch
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (statusMessage) {
            const timer = setTimeout(() => {
                setStatusMessage(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [statusMessage]);

    const handleGradeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubmission || !backendUrl) return;

        const numericMarks = Number(marks);

        if (isNaN(numericMarks) || numericMarks < 0) {
            setStatusMessage({
                type: 'error',
                text: 'Please enter a valid marks value'
            });
            return;
        }

        if (numericMarks > selectedSubmission.assignment.maxMarks) {
            setStatusMessage({
                type: 'error',
                text: `Marks cannot exceed maximum marks (${selectedSubmission.assignment.maxMarks})`
            });
            return;
        }

        try {
            setIsSubmitting(true);

            await axios.put(`${backendUrl}/ins/setGrade`, {
                submissionId: selectedSubmission.id,
                marks: numericMarks,
                feedback
            }, {
                headers: {
                    token: instructorToken
                }
            });

            // Update the submission in the current list
            setSubmissions(prev =>
                prev.map(sub =>
                    sub.id === selectedSubmission.id
                        ? { ...sub, grade: numericMarks, feedback }
                        : sub
                )
            );

            // Reset form and show success message
            setMarks('');
            setFeedback('');
            setSelectedSubmission(null);
            setStatusMessage({
                type: 'success',
                text: 'Grade submitted successfully'
            });

        } catch (error) {
            console.error('Error submitting grade:', error);
            setStatusMessage({
                type: 'error',
                text: 'Failed to submit grade. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetFilters = () => {
        setSearchQuery('');
        setFilter('all');
        setCurrentPage(1);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Submissions</h1>
                <p className="text-gray-600">Review and grade student assignment submissions</p>
            </div>

            {/* Status Message Toast */}
            {statusMessage && (
                <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 ${
                    statusMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                } animate-fadeIn`}>
                    {statusMessage.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                    <span>{statusMessage.text}</span>
                    <button onClick={() => setStatusMessage(null)} className="text-gray-500 hover:text-gray-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
                <div className="relative w-full md:w-auto flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search by student or assignment..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2.5 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                </div>

                <div className="bg-white border border-gray-300 rounded-lg flex overflow-hidden">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 text-sm font-medium ${filter === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('graded')}
                        className={`px-4 py-2 text-sm font-medium ${filter === 'graded' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                        Graded
                    </button>
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 text-sm font-medium ${filter === 'pending' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}`}
                    >
                        Pending
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-start">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                    {error}
                </div>
            )}

            {loading && submissions.length === 0 ? (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <table className="min-w-full">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-left border-b">Student</th>
                            <th className="px-6 py-3 text-left border-b">Assignment</th>
                            <th className="px-6 py-3 text-left border-b">Course</th>
                            <th className="px-6 py-3 text-left border-b">Status</th>
                            <th className="px-6 py-3 text-left border-b">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4 border-b">
                                    <div className="flex items-center">
                                        <div className="h-8 w-8 bg-gray-200 rounded-full mr-3"></div>
                                        <div>
                                            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 border-b"><div className="h-4 bg-gray-200 rounded w-36"></div></td>
                                <td className="px-6 py-4 border-b"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                <td className="px-6 py-4 border-b"><div className="h-6 bg-gray-200 rounded w-20"></div></td>
                                <td className="px-6 py-4 border-b"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : submissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center bg-gray-50 p-12 rounded-xl shadow-sm min-h-[350px] border border-gray-200">
                    <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                        <Clock className="h-16 w-16 text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Submissions Found</h3>
                    <p className="text-gray-600 mb-6 max-w-md text-center">
                        {searchQuery || filter !== 'all'
                            ? "No submissions match your filters. Try adjusting your search criteria."
                            : "There are no student submissions to review at this time."}
                    </p>
                    {(searchQuery || filter !== 'all') && (
                        <button
                            onClick={resetFilters}
                            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white">
                            <thead className="bg-gray-100">
                            <tr>
                                <th className="px-6 py-3 text-left border-b">Student</th>
                                <th className="px-6 py-3 text-left border-b">Assignment</th>
                                <th className="px-6 py-3 text-left border-b">Course</th>
                                <th className="px-6 py-3 text-left border-b">Status</th>
                                <th className="px-6 py-3 text-left border-b">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {submissions.map((submission) => (
                                <tr key={submission.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 border-b">
                                        <div className="flex items-center">
                                            {submission.student.image ? (
                                                <img
                                                    className="h-10 w-10 rounded-full mr-3 object-cover border border-gray-200"
                                                    src={submission.student.image}
                                                    alt={submission.student.name}
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-full mr-3 bg-blue-100 text-blue-500 flex items-center justify-center">
                                                    {submission.student.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-medium text-gray-900">{submission.student.name}</div>
                                                <div className="text-sm text-gray-500">{submission.student.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <div className="font-medium">{submission.assignment.title}</div>
                                        <div className="text-xs text-gray-500">Submitted: {formatDate(submission.submittedAt)}</div>
                                    </td>
                                    <td className="px-6 py-4 border-b">{submission.assignment.course.title}</td>
                                    <td className="px-6 py-4 border-b">
                                        {submission.grade !== undefined ? (
                                            <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-sm inline-flex items-center">
    <CheckCircle className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
    <span className="truncate">
      {submission.grade}/{submission.assignment.maxMarks}
    </span>
  </span>
                                        ) : (
                                            <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm inline-flex items-center">
    <Clock className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
    <span>Pending</span>
  </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 border-b">
                                        <div className="flex space-x-3">
                                            <a
                                                href={submission.submissionUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                View
                                            </a>
                                            <button
                                                onClick={() => {
                                                    setSelectedSubmission(submission);
                                                    setMarks(submission.grade?.toString() || '0');
                                                    setFeedback(submission.feedback || '');
                                                }}
                                                className="text-blue-600 hover:text-blue-800 inline-flex items-center"
                                            >
                                                <Pencil className="h-4 w-4 mr-1" />
                                                {submission.grade !== undefined ? 'Update' : 'Grade'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center p-4 border-t border-gray-200">
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
                </div>
            )}

            {/* Grade Submission Modal */}
            {selectedSubmission && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fadeIn">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full animate-scaleIn">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-900">
                                {selectedSubmission.grade !== undefined ? 'Update Grade' : 'Grade Submission'}
                            </h2>
                            <button onClick={() => setSelectedSubmission(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 mb-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Assignment</p>
                                    <p className="text-gray-900 mb-3">{selectedSubmission.assignment.title}</p>

                                    <p className="text-sm font-semibold text-gray-700 mb-1">Student</p>
                                    <p className="text-gray-900 mb-3">{selectedSubmission.student.name}</p>

                                    <a
                                        href={selectedSubmission.submissionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline inline-flex items-center"
                                    >
                                        <Eye className="h-4 w-4 mr-1.5" />
                                        View Submission
                                    </a>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-gray-700 mb-1">Course</p>
                                    <p className="text-gray-900 mb-3">{selectedSubmission.assignment.course.title}</p>

                                    <p className="text-sm font-semibold text-gray-700 mb-1">Submission Date</p>
                                    <p className="text-gray-900">{formatDate(selectedSubmission.submittedAt)}</p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleGradeSubmit}>
                            <div className="mb-4">
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Marks (max: {selectedSubmission.assignment.maxMarks})
                                </label>
                                <input
                                    type="number"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    min="0"
                                    max={selectedSubmission.assignment.maxMarks}
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Enter a value between 0 and {selectedSubmission.assignment.maxMarks}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 mb-2 font-medium">
                                    Feedback
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows={4}
                                    placeholder="Provide feedback on the student's submission..."
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSubmission(null)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-70 flex items-center"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        selectedSubmission.grade !== undefined ? 'Update Grade' : 'Submit Grade'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scaleIn {
                    animation: scaleIn 0.3s ease-out;
                }
            `}</style>
        </div>
    );
};
export default SubmissionsPage;