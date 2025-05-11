"use client";
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { AppContext } from '@/context/AppContext';
import { ArrowLeft, CheckCircle, Clock, X } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';

interface Question {
    id: string;
    question: string;
    questionType: string;
    options: string[];
    correctAnswer: string;
    difficultyLevel: string;
    topic: string;
    explanation?: string;
    imageUrl: string | null;
    codeSnippet: string | null;
}

interface Quiz {
    id: string;
    title: string;
    topic: string;
    difficultyLevel: string;
    type: string;
    questions: Question[];
    courseId?: string;
}

const QuizPage = () => {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();
    const quizId = searchParams.get('quizId');
    const courseId = params.id as string;

    const { token, backendUrl, submitQuiz } = useContext(AppContext) || {};
    const { showNotification } = useNotification();

    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
    const [timeRemaining, setTimeRemaining] = useState<number | null>(30 * 60);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);
    const [isStandaloneWindow, setIsStandaloneWindow] = useState(false);

    useEffect(() => {
        setIsStandaloneWindow(window.opener !== null);
    }, []);

    useEffect(() => {
        if (!quizId) return;

        const fetchQuiz = async () => {
            setIsLoading(true);

            try {
                if (token) {
                    const response = await fetch(`${backendUrl}/api/getQuizes`, {
                        headers: { token }
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to fetch quiz: ${response.status}`);
                    }

                    const data = await response.json();
                    const quizzesArray = data.quizzes || data;
                    const foundQuiz = Array.isArray(quizzesArray)
                        ? quizzesArray.find(quiz => quiz.id === quizId)
                        : quizzesArray.courseQuizzes?.find((quiz: { id: string }) => quiz.id === quizId);

                    if (foundQuiz) {
                        setQuiz(foundQuiz);
                        setTimeRemaining(foundQuiz.questions.length * 2 * 60);
                    } else {
                        showNotification('Quiz not found', 'error');
                    }
                }
            } catch (error: any) {
                showNotification(`Error loading quiz: ${error.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [quizId, backendUrl, token, showNotification]);

    useEffect(() => {
        if (timeRemaining === null || quizCompleted) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timer);
                    handleSubmitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeRemaining, quizCompleted]);

    const handleOptionSelect = (questionIndex: number, option: string) => {
        if (quiz?.questions[questionIndex]) {
            setSelectedAnswers(prev => ({
                ...prev,
                [quiz.questions[questionIndex].id]: option
            }));
        }
    };

    const handleNextQuestion = () => {
        if (quiz && currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        }
    };

    const handlePrevQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        }
    };

    const handleSubmitQuiz = async () => {
        if (!quiz || !token || !submitQuiz) return;

        setIsSubmitting(true);
        try {
            const answersArray = Object.entries(selectedAnswers).map(([questionId, answer]) => ({
                questionId,
                answer
            }));
            const result = await submitQuiz(quiz.id, answersArray);
            setQuizCompleted(true);
            setScore(result.result.attempt.score);
            showNotification('Quiz submitted successfully', 'success');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            showNotification('Failed to submit quiz', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCloseQuiz = () => {
        if (isStandaloneWindow) {
            window.close();
        } else {
            router.push(`/dashboard/courses/${courseId}`);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-50">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 w-full max-w-md text-center">
                    <div className="flex items-center justify-center space-x-1">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" style={{ animationDelay: '600ms' }}></div>
                    </div>
                    <p className="mt-4 text-sm text-gray-600">Loading quiz...</p>
                </div>
            </div>
        );
    }

    if (quizCompleted) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-50">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 w-full max-w-xl text-center">
                    <div className="flex items-center justify-center mb-6">
                        <CheckCircle className="h-16 w-16 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Completed!</h1>
                    <p className="text-gray-600 mb-6">Thank you for completing the quiz</p>

                    {score !== null && (
                        <div className="mb-8">
                            <div className="text-5xl font-bold text-blue-600 mb-2">{score}%</div>
                            <p className="text-gray-600">
                                {score >= 70 ? 'Great job!' : 'Keep practicing!'}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleCloseQuiz}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 font-medium"
                    >
                        {isStandaloneWindow ? 'Close Window' : 'Return to Course'}
                    </button>
                </div>
            </div>
        );
    }

    if (!quiz) {
        return (
            <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-50">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/30 w-full max-w-md text-center">
                    <div className="flex items-center justify-center mb-6">
                        <X className="h-12 w-12 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800 mb-2">Quiz Not Found</h1>
                    <p className="text-gray-600 mb-6">The quiz you're looking for is not available.</p>
                    <button
                        onClick={handleCloseQuiz}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition duration-200 font-medium"
                    >
                        {isStandaloneWindow ? 'Close Window' : 'Return to Course'}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-50">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/30 w-full max-w-4xl mx-4 overflow-hidden">
                <div className="bg-white p-5 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-800">{quiz.title}</h1>
                        <p className="text-sm text-gray-500">Question {currentQuestion + 1} of {quiz.questions.length}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        {timeRemaining !== null && (
                            <div className="flex items-center bg-blue-50 px-3 py-1.5 rounded-full">
                                <Clock className="h-4 w-4 text-blue-600 mr-1.5" />
                                <span className="text-sm font-medium text-blue-700">{formatTime(timeRemaining)}</span>
                            </div>
                        )}
                        <button
                            onClick={handleCloseQuiz}
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    <div className="mb-8">
                        <h2 className="text-lg font-medium text-gray-800 mb-4">
                            {quiz.questions[currentQuestion]?.question}
                        </h2>

                        {quiz.questions[currentQuestion]?.codeSnippet && (
                            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg mb-4 overflow-x-auto">
                                <code>{quiz.questions[currentQuestion].codeSnippet}</code>
                            </pre>
                        )}

                        {quiz.questions[currentQuestion]?.imageUrl && (
                            <div className="mb-4">
                                <img
                                    src={quiz.questions[currentQuestion].imageUrl}
                                    alt="Question"
                                    className="max-w-full rounded-lg"
                                />
                            </div>
                        )}

                        <div className="space-y-3">
                            {quiz.questions[currentQuestion]?.options.map((option, index) => (
                                <div
                                    key={index}
                                    className={`p-4 border rounded-xl cursor-pointer transition-all ${
                                        selectedAnswers[quiz.questions[currentQuestion].id] === option
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-blue-300'
                                    }`}
                                    onClick={() => handleOptionSelect(currentQuestion, option)}
                                >
                                    <p className="text-gray-800">{option}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevQuestion}
                            disabled={currentQuestion === 0}
                            className={`px-5 py-2.5 rounded-lg flex items-center font-medium ${
                                currentQuestion === 0
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            <ArrowLeft className="h-4 w-4 mr-1.5" />
                            Previous
                        </button>

                        {currentQuestion < quiz.questions.length - 1 ? (
                            <button
                                onClick={handleNextQuestion}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                            >
                                Next
                            </button>
                        ) : (
                            <button
                                onClick={handleSubmitQuiz}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                            </button>
                        )}
                    </div>
                </div>

                <div className="w-full bg-gray-100 h-1.5">
                    <div
                        className="bg-blue-600 h-full transition-all duration-300"
                        style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
                    ></div>
                </div>
            </div>
        </div>
    );
};

export default QuizPage;