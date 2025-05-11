"use client";
import React, { useState, useContext, useEffect } from 'react';
import {
    ThumbsUp,
    Send,
    ArrowLeft,
    Bug,
    Lightbulb,
    Star,
    MessageSquare,
    Award,
    AlertCircle,
    Info
} from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { AppContext } from '@/context/AppContext';

const FeedbackPage = () => {
    const  context = useContext(AppContext);
    const { data, token, backendUrl } = context || {};
    const [formData, setFormData] = useState({
        type: 'general',
        title: '',
        description: '',
        rating: 0,
        email: '',
        domain: 'tec'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [existingFeedback, setExistingFeedback] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkExistingFeedback = async () => {
            if (!data?.id || !token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(
                    `${backendUrl}/api/getUserFeedback/${data.id}`,
                    {
                        headers: {
                            token: token
                        }
                    }
                );

                if (response.data && response.data.length > 0) {
                    setExistingFeedback(response.data[0]);
                }
            } catch (err) {
                console.error("Error checking existing feedback:", err);
            } finally {
                setLoading(false);
            }
        };

        checkExistingFeedback();
    }, [data, token]);

    const handleChange = (e: { target: { name: any; value: any; }; }) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        if (!data?.id) {
            setError("You must be logged in to submit feedback");
            setIsSubmitting(false);
            return;
        }

        try {
            const feedbackData = {
                userId: data.id,
                type: formData.type.toUpperCase(),
                title: formData.title,
                description: formData.description,
                rating: formData.rating,
                domain: formData.domain.toUpperCase(),
                contactEmail: formData.email || undefined
            };

            // Send to API endpoint using axios with token
            const response = await axios.post(
                `${backendUrl}/api/submitSubmission`,
                feedbackData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    }
                }
            );

            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Something went wrong. Please try again.');
            console.error('Feedback submission error:', err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[50vh]">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-gray-600">Loading...</span>
            </div>
        );
    }

    if (existingFeedback) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Profile
                </Link>

                <div className="bg-white rounded-xl p-8 shadow-md border border-blue-100 mb-6">
                    <div className="flex items-center mb-4 text-blue-800">
                        <Info className="w-6 h-6 mr-2 text-blue-600" />
                        <h2 className="text-2xl font-bold">You've Already Submitted Feedback</h2>
                    </div>

                    <div className="bg-blue-50 p-5 rounded-lg mb-6">
                        <h3 className="font-medium text-lg mb-2">{existingFeedback.title}</h3>
                        <div className="flex items-center mb-2 text-sm text-gray-600">
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-3">
                                {existingFeedback.type}
                            </span>
                            <span className="flex items-center">
                                <span className="mr-1">Rating:</span>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        className={`w-4 h-4 ${star <= existingFeedback.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                    />
                                ))}
                            </span>
                        </div>
                        <p className="text-gray-700 mb-4">{existingFeedback.description}</p>
                        <div className="text-sm text-gray-500">
                            <p>Domain: {existingFeedback.domain}</p>
                            <p>Status: {existingFeedback.status || 'PENDING'}</p>
                        </div>
                    </div>

                    <p className="text-gray-600 mb-6">
                        You can only submit one feedback at a time. If your suggestion gets implemented,
                        you'll receive 100 points in your domain.
                    </p>

                    <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Profile
                    </Link>
                </div>
            </div>
        );
    }

    if (isSubmitted) {
        return (
            <div className="p-6 max-w-4xl mx-auto">
                <div className="bg-white rounded-xl p-8 shadow-md border border-blue-100 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ThumbsUp className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-blue-800 mb-4">Thank You for Your Feedback!</h2>
                    <p className="text-gray-600 mb-6">
                        Your feedback has been submitted successfully. If your suggestion gets implemented,
                        you'll receive 100 points in the {formData.domain.toUpperCase()} domain.
                    </p>
                    <Link
                        href="/dashboard/profile"
                        className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Return to Profile
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <Link
                    href="/dashboard/profile"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Back to Profile
                </Link>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}

                <div className="bg-white rounded-xl p-5 md:p-8 shadow-md border border-blue-100 mb-6">
                    <div className="flex items-center mb-4">
                        <MessageSquare className="w-6 h-6 mr-2 text-blue-600" />
                        <h1 className="text-2xl font-bold text-blue-800">Feedback & Suggestions</h1>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h2 className="text-lg font-semibold text-blue-800 mb-2 flex items-center">
                            <Award className="w-5 h-5 mr-2 text-blue-600" />
                            Earn Points Through Your Feedback
                        </h2>
                        <p className="text-gray-700 mb-3">
                            Your ideas matter! If your suggestion or feedback is selected and implemented
                            in our Learning Management System, you'll receive <span className="font-bold">100 points</span> in
                            your chosen domain.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="font-medium text-blue-800">🔧 TEC Domain</p>
                                <p className="text-gray-600">Technical suggestions and improvements</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="font-medium text-blue-800">🌟 SIL Domain</p>
                                <p className="text-gray-600">User experience and interface design</p>
                            </div>
                            <div className="bg-white rounded-lg p-3 border border-blue-100">
                                <p className="font-medium text-blue-800">📚 EDU Domain</p>
                                <p className="text-gray-600">Educational content improvements</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback Type
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <label className={`
                    flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${formData.type === 'bug' ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-blue-300'}
                  `}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="bug"
                                            checked={formData.type === 'bug'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <Bug className={`w-5 h-5 mr-2 ${formData.type === 'bug' ? 'text-red-500' : 'text-gray-400'}`} />
                                        <span className={formData.type === 'bug' ? 'text-red-700 font-medium' : 'text-gray-700'}>
                                            Report a Bug
                                        </span>
                                    </label>

                                    <label className={`
                    flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${formData.type === 'feature' ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-blue-300'}
                  `}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="feature"
                                            checked={formData.type === 'feature'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <Lightbulb className={`w-5 h-5 mr-2 ${formData.type === 'feature' ? 'text-green-500' : 'text-gray-400'}`} />
                                        <span className={formData.type === 'feature' ? 'text-green-700 font-medium' : 'text-gray-700'}>
                                            Feature Request
                                        </span>
                                    </label>

                                    <label className={`
                    flex items-center p-3 rounded-lg cursor-pointer border transition-all
                    ${formData.type === 'general' ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}
                  `}>
                                        <input
                                            type="radio"
                                            name="type"
                                            value="general"
                                            checked={formData.type === 'general'}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <MessageSquare className={`w-5 h-5 mr-2 ${formData.type === 'general' ? 'text-blue-500' : 'text-gray-400'}`} />
                                        <span className={formData.type === 'general' ? 'text-blue-700 font-medium' : 'text-gray-700'}>
                                            General Feedback
                                        </span>
                                    </label>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                    Title
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Brief title for your feedback"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Please provide details about your feedback..."
                                    rows={5}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    required
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Rate Your Experience
                                </label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => handleRatingChange(star)}
                                            className="p-1 focus:outline-none"
                                        >
                                            <Star
                                                className={`w-6 h-6 ${star <= formData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-1">
                                    Domain Category
                                </label>
                                <select
                                    id="domain"
                                    name="domain"
                                    value={formData.domain}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="tec">TEC - Technical</option>
                                    <option value="sil">SIL - User Experience</option>
                                    <option value="edu">EDU - Educational Content</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                    Email (optional)
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="For follow-up if needed"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    We'll only contact you if we need more information about your feedback.
                                </p>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`
                    w-full md:w-auto flex items-center justify-center py-2.5 px-6
                    rounded-lg font-medium transition-all
                    ${isSubmitting
                                        ? 'bg-gray-400 text-white cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'}
                  `}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Submitting...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4 mr-2" />
                                            Submit Feedback
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FeedbackPage;