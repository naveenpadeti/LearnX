"use client"
import React, { useContext, useState, useEffect } from 'react'
import { InstructorContext } from "@/context/InstructorContext";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

interface Question {
    id: string;
    question: string;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficultyLevel: string;
    topic?: string;
    imageUrl?: string | null;
    codeSnippet?: string | null;
}

interface Quiz {
    id: string;
    title: string;
    description?: string;
    topic: string;
    type: string;
    difficultyLevel: string;
    timeLimit?: number;
    passingScore?: number;
    questions: Question[];
}

const QuizDetailPage = () => {
    const { backendUrl, instructorToken } = useContext(InstructorContext) || {};
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [showAddQuestion, setShowAddQuestion] = useState<boolean>(false);
    const [newQuestion, setNewQuestion] = useState({
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        difficultyLevel: 'BEGINNER',
        topic: '',
        questionType: 'MULTIPLE_CHOICE',
        explanation: ""
    });

    const params = useParams();
    const router = useRouter();
    const quizId = params.id as string;

    useEffect(() => {
        getQuiz();
    }, [quizId]);

    const getQuiz = async () => {
        if (!backendUrl || !instructorToken) return;

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${backendUrl}/ins/quiz/${quizId}`, {
                headers: { token: instructorToken }
            });
            setQuiz(response.data.quiz);
        } catch (error) {
            console.error("Error fetching quiz:", error);
            setError("Failed to load quiz details. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const deleteQuestion = async (questionId: string) => {
        if (!confirm("Are you sure you want to delete this question? This action cannot be undone.")) {
            return;
        }

        try {
            await axios.delete(`${backendUrl}/ins/quiz/question/${questionId}`, {
                headers: { token: instructorToken }
            });

            // Update local state
            if (quiz) {
                setQuiz({
                    ...quiz,
                    questions: quiz.questions.filter(q => q.id !== questionId)
                });
            }
        } catch (error) {
            console.error("Error deleting question:", error);
            alert("Failed to delete question. It may have existing student responses.");
        }
    };

    const saveQuestion = async (question: Question) => {
        try {
            await axios.put(`${backendUrl}/ins/quiz/question/${question.id}`, question, {
                headers: { token: instructorToken }
            });

            if (quiz) {
                setQuiz({
                    ...quiz,
                    questions: quiz.questions.map(q => q.id === question.id ? question : q)
                });
            }

            setEditingQuestion(null);
        } catch (error) {
            console.error("Error updating question:", error);
            alert("Failed to update question. Please try again.");
        }
    };

    const addQuestion = async () => {
        try {
            const questionData = {
                ...newQuestion,
                // Make sure all required fields are included and match enum types
                questionType: 'MULTIPLE_CHOICE', // Required field from QuestionType enum
                difficultyLevel: newQuestion.difficultyLevel || 'BEGINNER', // Required field from DifficultyLevel enum
                topic: newQuestion.topic || quiz?.topic || '', // Optional in schema (marked with ?)
                imageUrl: null, // Optional in schema
                codeSnippet: null // Optional in schema
            };

            // Make sure the endpoint path is correct (singular "question")
            const response = await axios.post(`${backendUrl}/ins/quiz/${quizId}/questions`, questionData, {
                headers: { token: instructorToken }
            });

            // Update local state
            if (quiz && response.data) {
                setQuiz({
                    ...quiz,
                    questions: [...quiz.questions, response.data.question || response.data]
                });
            }

            // Reset form
            setNewQuestion({
                question: '',
                options: ['', '', '', ''],
                correctAnswer: '',
                difficultyLevel: 'BEGINNER',
                topic: '',
                questionType: 'MULTIPLE_CHOICE',
                explanation: ''
            });
            setShowAddQuestion(false);
        } catch (error:any) {
            console.error("Error adding question:", error);
            const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
            alert(`Failed to add question: ${errorMessage}`);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                    {error}
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="container mx-auto p-6">
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200 text-yellow-700">
                    Quiz not found
                </div>
                <button
                    onClick={() => router.back()}
                    className="mt-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">{quiz.title}</h1>
                <div className="space-x-2">
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => setShowAddQuestion(!showAddQuestion)}
                    >
                        {showAddQuestion ? 'Cancel' : 'Add Question'}
                    </button>
                    <button
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                        onClick={() => router.back()}
                    >
                        Back
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <h2 className="text-lg font-medium">Quiz Details</h2>
                        <dl className="mt-2 space-y-1">
                            <div className="flex">
                                <dt className="text-sm font-medium text-gray-500 w-32">Topic:</dt>
                                <dd className="text-sm text-gray-900">{quiz.topic}</dd>
                            </div>
                            <div className="flex">
                                <dt className="text-sm font-medium text-gray-500 w-32">Type:</dt>
                                <dd className="text-sm text-gray-900">{quiz.type.replace(/_/g, ' ')}</dd>
                            </div>
                            <div className="flex">
                                <dt className="text-sm font-medium text-gray-500 w-32">Difficulty:</dt>
                                <dd className="text-sm text-gray-900">{quiz.difficultyLevel}</dd>
                            </div>
                            {quiz.timeLimit && (
                                <div className="flex">
                                    <dt className="text-sm font-medium text-gray-500 w-32">Time Limit:</dt>
                                    <dd className="text-sm text-gray-900">{quiz.timeLimit} minutes</dd>
                                </div>
                            )}
                            {quiz.passingScore && (
                                <div className="flex">
                                    <dt className="text-sm font-medium text-gray-500 w-32">Passing Score:</dt>
                                    <dd className="text-sm text-gray-900">{quiz.passingScore}%</dd>
                                </div>
                            )}
                        </dl>
                    </div>
                    <div>
                        <h2 className="text-lg font-medium">Quiz Summary</h2>
                        <dl className="mt-2 space-y-1">
                            <div className="flex">
                                <dt className="text-sm font-medium text-gray-500 w-32">Total Questions:</dt>
                                <dd className="text-sm text-gray-900">{quiz.questions.length}</dd>
                            </div>
                            <div className="flex">
                                <dt className="text-sm font-medium text-gray-500 w-32">Topics Covered:</dt>
                                <dd className="text-sm text-gray-900">
                                    {Array.from(new Set(quiz.questions.map(q => q.topic))).filter(Boolean).join(', ') || 'N/A'}
                                </dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>

            {showAddQuestion && (
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Add New Question</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                rows={3}
                                value={newQuestion.question}
                                onChange={(e) => setNewQuestion({...newQuestion, question: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                            {newQuestion.options?.map((option, idx) => (
                                <div key={idx} className="flex items-center mb-2">
                                    <input
                                        type="radio"
                                        name="correctAnswer"
                                        checked={newQuestion.correctAnswer === option}
                                        onChange={() => setNewQuestion({...newQuestion, correctAnswer: option})}
                                        className="mr-2"
                                    />
                                    <input
                                        type="text"
                                        className="w-full p-2 border rounded-md"
                                        value={option}
                                        onChange={(e) => {
                                            const newOptions = [...newQuestion.options as string[]];
                                            newOptions[idx] = e.target.value;
                                            setNewQuestion({...newQuestion, options: newOptions});

                                            // Update correctAnswer if it was this option
                                            if (newQuestion.correctAnswer === newQuestion.options?.[idx]) {
                                                setNewQuestion({
                                                    ...newQuestion,
                                                    options: newOptions,
                                                    correctAnswer: e.target.value
                                                });
                                            }
                                        }}
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded-md"
                                    value={newQuestion.topic || ''}
                                    onChange={(e) => setNewQuestion({...newQuestion, topic: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    className="w-full p-2 border rounded-md"
                                    value={newQuestion.difficultyLevel}
                                    onChange={(e) => setNewQuestion({...newQuestion, difficultyLevel: e.target.value})}
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                            <textarea
                                className="w-full p-2 border rounded-md"
                                rows={2}
                                value={newQuestion.explanation || ''}
                                onChange={(e) => setNewQuestion({...newQuestion, explanation: e.target.value})}
                            />
                        </div>

                        <div className="flex justify-end space-x-2">
                            <button
                                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                onClick={() => setShowAddQuestion(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                onClick={addQuestion}
                                disabled={!newQuestion.question ||
                                    !newQuestion.options?.some(opt => opt.trim() !== '') ||
                                    !newQuestion.correctAnswer}
                            >
                                Add Question
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="text-xl font-semibold mt-8 mb-4">Quiz Questions ({quiz.questions.length})</h2>

            {quiz.questions.length === 0 ? (
                <div className="bg-gray-50 p-8 text-center rounded-lg border">
                    <p className="text-gray-500">No questions added yet.</p>
                    <button
                        className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        onClick={() => setShowAddQuestion(true)}
                    >
                        Add Your First Question
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {quiz.questions.map((question, index) => (
                        <div key={question.id} className="bg-white rounded-lg shadow p-6">
                            {editingQuestion?.id === question.id ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
                                        <textarea
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                            value={editingQuestion.question}
                                            onChange={(e) => setEditingQuestion({...editingQuestion, question: e.target.value})}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Options</label>
                                        {editingQuestion.options?.map((option, idx) => (
                                            <div key={idx} className="flex items-center mb-2">
                                                <input
                                                    type="radio"
                                                    name={`correctAnswer-${question.id}`}
                                                    checked={editingQuestion.correctAnswer === option}
                                                    onChange={() => setEditingQuestion({...editingQuestion, correctAnswer: option})}
                                                    className="mr-2"
                                                />
                                                <input
                                                    type="text"
                                                    className="w-full p-2 border rounded-md"
                                                    value={option}
                                                    onChange={(e) => {
                                                        const newOptions = [...editingQuestion.options];
                                                        newOptions[idx] = e.target.value;

                                                        // Update correctAnswer if it was this option
                                                        if (editingQuestion.correctAnswer === editingQuestion.options[idx]) {
                                                            setEditingQuestion({
                                                                ...editingQuestion,
                                                                options: newOptions,
                                                                correctAnswer: e.target.value
                                                            });
                                                        } else {
                                                            setEditingQuestion({
                                                                ...editingQuestion,
                                                                options: newOptions
                                                            });
                                                        }
                                                    }}
                                                    placeholder={`Option ${idx + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                                            <input
                                                type="text"
                                                className="w-full p-2 border rounded-md"
                                                value={editingQuestion.topic || ''}
                                                onChange={(e) => setEditingQuestion({...editingQuestion, topic: e.target.value})}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                            <select
                                                className="w-full p-2 border rounded-md"
                                                value={editingQuestion.difficultyLevel}
                                                onChange={(e) => setEditingQuestion({...editingQuestion, difficultyLevel: e.target.value})}
                                            >
                                                <option value="EASY">Easy</option>
                                                <option value="MEDIUM">Medium</option>
                                                <option value="HARD">Hard</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Explanation (Optional)</label>
                                        <textarea
                                            className="w-full p-2 border rounded-md"
                                            rows={2}
                                            value={editingQuestion.explanation || ''}
                                            onChange={(e) => setEditingQuestion({...editingQuestion, explanation: e.target.value})}
                                        />
                                    </div>

                                    <div className="flex justify-end space-x-2 pt-2">
                                        <button
                                            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                                            onClick={() => setEditingQuestion(null)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                            onClick={() => saveQuestion(editingQuestion)}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-medium">
                                            <span className="text-gray-500 mr-2">{index + 1}.</span>
                                            {question.question}
                                        </h3>
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-1 text-blue-600 hover:text-blue-800"
                                                onClick={() => setEditingQuestion(question)}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="p-1 text-red-600 hover:text-red-800"
                                                onClick={() => deleteQuestion(question.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {question.options.map((option, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-2 rounded-md ${
                                                    option === question.correctAnswer
                                                        ? 'bg-green-50 border border-green-200'
                                                        : 'bg-gray-50 border border-gray-200'
                                                }`}
                                            >
                                                <span className="inline-block w-5">{String.fromCharCode(65 + idx)}.</span>
                                                {option}
                                                {option === question.correctAnswer && (
                                                    <span className="ml-2 text-xs text-green-700 font-medium">✓ Correct</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {question.explanation && (
                                        <div className="mt-3 text-sm text-gray-700">
                                            <span className="font-medium">Explanation: </span>
                                            {question.explanation}
                                        </div>
                                    )}

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {question.topic && (
                                            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                        Topic: {question.topic}
                      </span>
                                        )}
                                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                      {question.difficultyLevel}
                    </span>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuizDetailPage;