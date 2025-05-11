'use client';

import React, { useState } from 'react';
import { Book, X, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';

interface QuizQuestion {
    text: string;
    options: string[];
    correctAnswer: string;
}

interface Quiz {
    id: string | number;
    title: string;
    questions: QuizQuestion[];
    questionType?: string;
}

interface QuizModalProps {
    quiz: Quiz;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (score: number) => void;
}

const QuizModal: React.FC<QuizModalProps> = ({
                                                 quiz,
                                                 isOpen,
                                                 onClose,
                                                 onSubmit
                                             }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [score, setScore] = useState<number | null>(null);

    const handleAnswerSelect = (questionIndex: number, answer: string) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionIndex]: answer
        }));
    };

    const handleSubmitQuiz = async () => {
        setIsSubmitting(true);
        try {
            // Simulate quiz submission
            // Replace with actual API call in your implementation
            const calculatedScore = calculateScore();
            setScore(calculatedScore);
            setQuizCompleted(true);
            onSubmit?.(calculatedScore);
        } catch (error) {
            console.error("Error submitting quiz:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const calculateScore = () => {
        // Simple scoring mechanism
        // In real implementation, this would come from backend
        const totalQuestions = quiz.questions.length;
        const correctAnswers = quiz.questions.filter((question, index) =>
            selectedAnswers[index] === question.correctAnswer
        ).length;
        return Math.round((correctAnswers / totalQuestions) * 100);
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setSelectedAnswers({});
        setQuizCompleted(false);
        setScore(null);
    };

    if (!isOpen) return null;

    const questions = quiz.questions || [];

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{quiz.title}</h2>
                    <button
                        onClick={onClose}
                        className="hover:bg-gray-100 rounded-full p-2 transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-600" />
                    </button>
                </div>

                {/* Quiz Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(100vh-200px)]">
                    {quizCompleted ? (
                        <div className="flex flex-col items-center justify-center text-center space-y-4">
                            <CheckCircle className="w-24 h-24 text-green-500" />
                            <h3 className="text-2xl font-bold text-gray-800">Quiz Completed!</h3>
                            <p className="text-lg text-gray-600">Your Score: {score}%</p>
                            <div className="flex space-x-4">
                                <button
                                    onClick={resetQuiz}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                                >
                                    Retake Quiz
                                </button>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        questions.length > 0 ? (
                            <div>
                                {/* Question Header */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-sm text-gray-500">
                                            Question {currentQuestion + 1} of {questions.length}
                                        </span>
                                        {quiz.questionType && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {quiz.questionType.replace('_', ' ')}
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                        {questions[currentQuestion]?.text}
                                    </h4>

                                    {/* Answer Options */}
                                    <div className="space-y-3">
                                        {questions[currentQuestion]?.options?.map((option, index) => (
                                            <div
                                                key={index}
                                                onClick={() => handleAnswerSelect(currentQuestion, option)}
                                                className={`
                                                    p-3 border rounded-lg cursor-pointer transition-colors 
                                                    ${selectedAnswers[currentQuestion] === option
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 hover:bg-gray-50'}
                                                `}
                                            >
                                                <div className="flex items-center">
                                                    <div
                                                        className={`
                                                            w-5 h-5 rounded-full border mr-3
                                                            ${selectedAnswers[currentQuestion] === option
                                                            ? 'border-blue-500 bg-blue-500'
                                                            : 'border-gray-300'}
                                                        `}
                                                    >
                                                        {selectedAnswers[currentQuestion] === option && (
                                                            <div className="w-2 h-2 bg-white rounded-full m-auto"></div>
                                                        )}
                                                    </div>
                                                    <span className="text-gray-800">{option}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Navigation Buttons */}
                                <div className="flex justify-between mt-6 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => setCurrentQuestion(prev => Math.max(0, prev - 1))}
                                        disabled={currentQuestion === 0}
                                        className={`
                                            px-4 py-2 rounded-lg 
                                            ${currentQuestion === 0
                                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            : 'bg-gray-200 hover:bg-gray-300'}
                                        `}
                                    >
                                        Previous
                                    </button>

                                    {currentQuestion < questions.length - 1 ? (
                                        <button
                                            onClick={() => setCurrentQuestion(prev => Math.min(questions.length - 1, prev + 1))}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                        >
                                            Next
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleSubmitQuiz}
                                            disabled={
                                                isSubmitting ||
                                                Object.keys(selectedAnswers).length < questions.length
                                            }
                                            className={`
                                                px-4 py-2 rounded-lg 
                                                ${isSubmitting || Object.keys(selectedAnswers).length < questions.length
                                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700'}
                                            `}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center">
                                <p className="text-gray-600 mb-4">This quiz has no questions yet.</p>
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Close
                                </button>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};
export default QuizModal;