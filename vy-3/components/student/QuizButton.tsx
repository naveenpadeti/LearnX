import { useRouter } from 'next/navigation';
import React from 'react';
import { BookOpen, Check } from 'lucide-react';

interface QuizStartButtonProps {
    quizId: string;
    courseId: string;
    title?: string;
    className?: string;
    attempts?: any[];
    showScore?: boolean;
}

const QuizStartButton = ({
                             quizId,
                             courseId,
                             title = "Start Quiz",
                             className = "",
                             attempts = [],
                             showScore = false
                         }: QuizStartButtonProps) => {
    const router = useRouter();

    const handleStartQuiz = () => {
        const url = `/dashboard/courses/${courseId}/quiz?quizId=${quizId}`;
        window.open(url, '_blank');
    };

    // If we have attempts and showScore is true, display the best score
    if (showScore && attempts && attempts.length > 0) {
        // Find the highest score among attempts
        const bestScore = Math.max(...attempts.map(attempt => attempt.score || 0));

        return (
            <div className={`flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium ${className}`}>
                <Check size={18} />
                <span>Score: {bestScore}%</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleStartQuiz}
            className={`flex items-center space-x-2 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors px-4 py-2 rounded-lg font-medium ${className}`}
        >
            <BookOpen size={18} />
            <span>{title}</span>
        </button>
    );
};

export default QuizStartButton;