"use client";
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { BookOpen, Upload, Loader2, Calendar, Clock, Users, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { InstructorContext } from "@/context/InstructorContext";

const courseTypeDescriptions: Record<string, string> = {
    'IIE': 'Innovation, Incubation & Entrepreneurship - Courses focused on fostering innovation, startup incubation, and entrepreneurial skills.',
    'TEC': 'Technical Education - Courses that enhance technical expertise, practical skills, and knowledge in various engineering and technology fields.',
    'ESO': 'Extension Activities and Social Outreach - Courses emphasizing community service, leadership, and social responsibility for holistic development.',
    'LCH': 'Liberal Arts, Creative Arts, and Hobby Clubs - Courses encouraging creativity, critical thinking, and artistic expression for well-rounded growth.',
    'HWB': 'Health & Wellbeing - Courses promoting physical, mental, and emotional wellness for a balanced and healthy lifestyle.'
};

const CreateCoursePage = () => {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courseType, setCourseType] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [duration, setDuration] = useState('');
    const [difficulty, setDifficulty] = useState('BEGINNER');
    const context = useContext(InstructorContext);
    const backendUrl = context?.backendUrl;
    const currentToken = context?.instructorToken;
    const difficultyLevels = [
        { value: "BEGINNER", label: "Beginner" },
        { value: "INTERMEDIATE", label: "Intermediate" },
        { value: "ADVANCED", label: "Advanced" },
        { value: "ALL_LEVELS", label: "All Levels" }
    ];

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        if (!currentToken) {
            setError('Authentication token is missing. Please log in again.');
            setLoading(false);
            return;
        }
        if (!imageFile) {
            setError('Please select a course image');
            setLoading(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('description', description);
            formData.append('courseType', courseType);
            formData.append('file', imageFile);
            formData.append('id', context?.instructorData?.id || '');
            formData.append('duration', duration);
            formData.append('difficulty', difficulty);

            console.log('Submitting with token:', currentToken?.substring(0, 10) + '...');

            const response = await axios.post(
                `${backendUrl}/ins/createCourse`,
                formData,
                {
                    headers: {
                        token: currentToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Course created successfully:', response.data);
            router.push('/instructor/dashboard/manage'); // Redirect after success

        } catch (error: any) {
            console.error('Error creating course:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                if (error.response.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else {
                    setError(`Server error: ${error.response.status} - ${error.response.data.message || 'Unknown error'}`);
                }
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response from server. Please check your internet connection.');
            } else {
                // Something happened in setting up the request
                setError(`Request failed: ${error.message}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 min-h-screen ">
            <div className="max-w-3xl mx-auto bg-white rounded-lg p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center space-x-4">
                        <BookOpen className="w-8 h-8 text-blue-600" />
                        <h1 className="text-3xl font-bold text-blue-800">Create New Course</h1>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-100">
                            {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                                Course Title*
                            </label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="courseType" className="block text-sm font-medium text-gray-700 mb-1">
                                Course Type*
                            </label>
                            <select
                                id="courseType"
                                value={courseType}
                                onChange={(e) => setCourseType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Course Type</option>
                                <option value="IIE">IIE</option>
                                <option value="TEC">TEC</option>
                                <option value="ESO">ESO</option>
                                <option value="LCH">LCH</option>
                                <option value="HWB">HWB</option>
                            </select>
                            {courseType && (
                                <p className="mt-1 text-sm text-gray-500">
                                    {courseTypeDescriptions[courseType]}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                                <Clock className="inline w-4 h-4 mr-1" /> Estimated Duration
                            </label>
                            <input
                                type="text"
                                id="duration"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g. 6 weeks, 20 hours"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
                                <Users className="inline w-4 h-4 mr-1" /> Difficulty Level
                            </label>
                            <select
                                id="difficulty"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {difficultyLevels.map(level => (
                                    <option key={level.value} value={level.value}>{level.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Description*
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Describe what students will learn, course objectives, and key outcomes"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
                            Course Cover Image*
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center">
                            <input
                                type="file"
                                id="image"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <label
                                htmlFor="image"
                                className="flex flex-col items-center cursor-pointer"
                            >
                                {imagePreview ? (
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="w-full max-h-48 object-contain mb-4"
                                    />
                                ) : (
                                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                                )}
                                <span className="text-sm text-blue-600 font-medium">
                                    {imagePreview ? 'Change image' : 'Upload course cover image'}
                                </span>
                                <span className="text-xs text-gray-500 mt-1">
                                    Recommended size: 1280x720 pixels (16:9 ratio)
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-md border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
                            <Tag className="w-4 h-4 mr-1" /> Important Note
                        </h3>
                        <p className="text-xs text-blue-600">
                            After creating your course, you'll be able to add chapters and lectures with video content, assignments,
                            and other materials from your course dashboard.
                        </p>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-md mr-4 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center min-w-[120px]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Course'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default CreateCoursePage;