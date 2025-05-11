"use client";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, Filter, Search, ThumbsUp, X } from 'lucide-react';

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

interface FeedbackUser {
    id: string;
    name: string;
    email: string;
    image?: string;
}

interface Feedback {
    id: string;
    title: string;
    description: string;
    type: 'bug' | 'feature' | 'general';
    domain: 'tec' | 'sil' | 'edu';
    rating: number;
    isApproved?: boolean;
    createdAt: string;
    userId?: string;
    email?: string;
    submittedBy?: FeedbackUser;
}

const typeColors: Record<string, string> = {
    bug: 'bg-red-100 text-red-800 border border-red-200',
    feature: 'bg-green-100 text-green-800 border border-green-200',
    general: 'bg-blue-100 text-blue-800 border border-blue-200'
};

const domainLabels: Record<string, string> = {
    tec: 'Technical',
    sil: 'User Experience',
    edu: 'Educational Content'
};

const FeedbackAdminPage = () => {
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        type: '',
        domain: '',
        searchTerm: ''
    });

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                setIsLoading(true);
                const token = localStorage.getItem('token');

                const response = await axios.get(
                    `${backendUrl}/admin/getAllFeedback`,
                    {
                        headers: {
                            token: token
                        }
                    }
                );

                setFeedbackList(response.data.feedback || []);
                setError(null);
            } catch (err) {
                console.error("Error fetching feedback:", err);
                setError("Failed to load feedback. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeedback();
    }, []);

    const handleApprove = async (feedbackId: string, isApproved: boolean) => {
        try {
            const token = localStorage.getItem('token');

            await axios.put(
                `${backendUrl}/api/admin/updateFeedbackStatus/${feedbackId}`,
                { isApproved },
                {
                    headers: {
                        token: token
                    }
                }
            );

            setFeedbackList(prevList =>
                prevList.map(item =>
                    item.id === feedbackId ? {...item, isApproved} : item
                )
            );

        } catch (err) {
            console.error("Error updating feedback status:", err);
            alert("Failed to update feedback status. Please try again.");
        }
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const filteredFeedback = feedbackList.filter(item => {
        return (
            (filters.type === '' || item.type === filters.type) &&
            (filters.domain === '' || item.domain === filters.domain) &&
            (filters.searchTerm === '' ||
                item.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(filters.searchTerm.toLowerCase()))
        );
    });

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Feedback Management</h1>
                <p className="text-gray-600">Review and manage user feedback submissions</p>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Filter by Type
                        </label>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">All Types</option>
                            <option value="bug">Bug Reports</option>
                            <option value="feature">Feature Requests</option>
                            <option value="general">General Feedback</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Filter className="w-4 h-4 inline mr-1" />
                            Filter by Domain
                        </label>
                        <select
                            name="domain"
                            value={filters.domain}
                            onChange={handleFilterChange}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="">All Domains</option>
                            <option value="tec">Technical</option>
                            <option value="sil">User Experience</option>
                            <option value="edu">Educational Content</option>
                        </select>
                    </div>

                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            <Search className="w-4 h-4 inline mr-1" />
                            Search
                        </label>
                        <input
                            type="text"
                            name="searchTerm"
                            value={filters.searchTerm}
                            onChange={handleFilterChange}
                            placeholder="Search in title or description"
                            className="w-full p-2 border border-gray-300 rounded-md"
                        />
                    </div>
                </div>
            </div>

            {/* Feedback List */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="ml-2 text-gray-600">Loading feedback...</span>
                </div>
            ) : error ? (
                <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-700">
                    {error}
                </div>
            ) : filteredFeedback.length === 0 ? (
                <div className="bg-gray-50 p-8 rounded-lg text-center text-gray-500">
                    No feedback found matching your criteria.
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredFeedback.map(feedback => (
                        <div key={feedback.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-blue-500">
                            <div className="flex flex-col md:flex-row justify-between mb-2">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-800">{feedback.title}</h2>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {/* Custom badge for type */}
                                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${typeColors[feedback.type]}`}>
                      {feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}
                    </span>
                                        {/* Custom badge for rating */}
                                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 flex items-center">
                      <ThumbsUp className="w-3 h-3 mr-1" />
                      Rating: {feedback.rating}/5
                    </span>
                                    </div>
                                </div>
                                <div className="mt-2 md:mt-0 text-sm text-gray-500">
                                    <div>Submitted By:</div>
                                    <div> {feedback.userId || 'Anonymous'}</div>
                                </div>
                            </div>

                            <p className="text-gray-600 my-3">{feedback.description}</p>

                            <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                                <div className="text-sm text-gray-500">
                                    {feedback.email && (
                                        <div>Contact: {feedback.email}</div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleApprove(feedback.id, true)}
                                        className={`px-3 py-1 rounded-md flex items-center text-sm ${
                                            feedback.isApproved
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                                        }`}
                                    >
                                        <Check className="w-4 h-4 mr-1" />
                                        {feedback.isApproved ? 'Approved' : 'Approve'}
                                    </button>

                                    <button
                                        onClick={() => handleApprove(feedback.id, false)}
                                        className={`px-3 py-1 rounded-md flex items-center text-sm ${
                                            feedback.isApproved === false
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                                        }`}
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        {feedback.isApproved === false ? 'Rejected' : 'Reject'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default FeedbackAdminPage;