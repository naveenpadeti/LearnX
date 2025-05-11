import prisma from "../config/dbConfig";
import model from "../config/gemini";
import { QuestionType, DifficultyLevel } from "@prisma/client";

interface QuestionGenerationParams {
    topic: string;
    count: number;
    type: QuestionType;
    difficulty: DifficultyLevel;
}

interface QuestionData {
    question: string;
    questionType: QuestionType;
    options: string[];
    correctAnswer: string;
    explanation?: string;
    difficultyLevel: DifficultyLevel;
    topic: string;
    imageUrl: string | null;
    codeSnippet: string | null;
}

interface TopicPerformance {
    [key: string]: {
        correct: number;
        total: number;
    };
}

export async function generateQuestions({
                                            topic,
                                            count,
                                            type,
                                            difficulty
                                        }: QuestionGenerationParams): Promise<QuestionData[]> {
    try {
        let prompt = `Generate ${count} ${difficulty.toLowerCase()} level quiz questions about ${topic}.`;

        switch (type) {
            case 'MULTIPLE_CHOICE':
                prompt += ` Each question should have 4 options (A, B, C, D) with exactly one correct answer. Format as JSON array: [{"question": "Question text", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option X", "explanation": "Why this is correct"}]`;
                break;
            case 'TRUE_FALSE':
                prompt += ` Each should be a true/false statement. Format as JSON array: [{"question": "Statement to evaluate", "options": ["True", "False"], "correctAnswer": "True or False", "explanation": "Why this is correct"}]`;
                break;
            case 'SHORT_ANSWER':
                prompt += ` Each should require a short text answer. Format as JSON array: [{"question": "Question text", "correctAnswer": "Model answer", "explanation": "Explanation of answer"}]`;
                break;
            case 'CODE_SNIPPET':
                prompt += ` Each should include a code challenge. Format as JSON array: [{"question": "Problem statement", "codeSnippet": "Starter code here", "correctAnswer": "Expected solution", "explanation": "Explanation of solution"}]`;
                break;
            case 'IMAGE_BASED':
                prompt += ` Each should describe an image-based question (note: actual images will be added separately). Format as JSON array: [{"question": "Question about an image", "options": ["Option A", "Option B", "Option C", "Option D"], "correctAnswer": "Option X", "explanation": "Why this is correct"}]`;
                break;
        }

        // Call Gemini API
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract and parse JSON from response
        const jsonStr = text.substring(
            text.indexOf('['),
            text.lastIndexOf(']') + 1
        );

        const questions = JSON.parse(jsonStr);

        // Format questions for database
        return questions.map((q: any) => ({
            question: q.question,
            questionType: type,
            options: q.options || [],
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficultyLevel: difficulty,
            topic: topic,
            imageUrl: q.imageUrl || null,
            codeSnippet: q.codeSnippet || null
        }));
    } catch (error) {
        console.error('Error generating questions:', error);
        throw new Error(`Failed to generate questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function createQuiz({
                                     title,
                                     courseId,
                                     chapterId,
                                     lectureId,
                                     topic,
                                     questionCount,
                                     questionType,
                                     difficulty
                                 }: {
    title: string;
    courseId?: string;
    chapterId?: string;
    lectureId?: string;
    topic: string;
    questionCount: number;
    questionType: QuestionType;
    difficulty: DifficultyLevel;
}) {
    try {
        let quizId: string;
        const timestamp = Date.now().toString();
        if (courseId) {
            quizId = `${courseId}_quiz_${timestamp}`;
        } else if (chapterId) {
            quizId = `${chapterId}_quiz_${timestamp}`;
        } else if (lectureId) {
            quizId = `${lectureId}_quiz_${timestamp}`;
        } else {
            quizId = `Quiz_${timestamp}`;
        }

        const quiz = await prisma.quiz.create({
            data: {
                id: quizId,
                title,
                courseId,
                chapterId,
                lectureId,
                topic,
                difficultyLevel: difficulty,
                type: questionType
            }
        });

        const questions = await generateQuestions({
            topic,
            count: questionCount,
            type: questionType,
            difficulty
        });

        // Add questions to quiz
        await Promise.all(
            questions.map((questionData) =>
                prisma.question.create({
                    data: {
                        ...questionData,
                        quizId: quiz.id
                    }
                })
            )
        );

        // Return quiz with questions
        return await prisma.quiz.findUnique({
            where: { id: quiz.id },
            include: { questions: true }
        });
    } catch (error) {
        console.error('Error creating quiz:', error);
        throw new Error(`Failed to create quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function evaluateAnswer(questionId: string, userAnswer: string) {
    try {
        // Get question from database
        const question = await prisma.question.findUnique({
            where: { id: questionId }
        });

        if (!question) {
            throw new Error('Question not found');
        }

        let isCorrect = false;
        let feedback = '';

        // Evaluate based on question type
        if (question.questionType === 'MULTIPLE_CHOICE' || question.questionType === 'TRUE_FALSE') {
            // Simple comparison for MCQs and T/F
            isCorrect = userAnswer === question.correctAnswer;
            feedback = isCorrect
                ? "Correct!"
                : `Incorrect. The correct answer is ${question.correctAnswer}. ${question.explanation || ''}`;
        } else {
            // Use Gemini API for short answer and code questions
            const prompt = `
Question: ${question.question}
Correct answer: ${question.correctAnswer}
User's answer: ${userAnswer}

Evaluate if the user's answer is correct. Consider partial correctness.
Return a JSON object with:
1. "isCorrect": boolean (true if fully or mostly correct)
2. "score": number between 0 and 1 representing correctness
3. "feedback": constructive explanation of what was right/wrong
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response - using safer regex without /s flag
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const evaluation = JSON.parse(jsonMatch[0]);
                isCorrect = evaluation.isCorrect;
                feedback = evaluation.feedback;
            } else {
                isCorrect = false;
                feedback = "Unable to evaluate answer properly. Please review the correct answer: " + question.correctAnswer;
            }
        }

        return { isCorrect, feedback };
    } catch (error) {
        console.error('Error evaluating answer:', error);
        throw new Error(`Failed to evaluate answer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function submitQuizAttempt(
    quizId: string,
    studentId: string,
    answers: Array<{questionId: string, answer: string}>
) {
    try {
        // Get quiz with questions
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) {
            throw new Error('Quiz not found');
        }

        // Create quiz attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                studentId,
                quizId,

                totalQuestions: quiz.questions.length,
                startedAt: new Date()
            }
        });

        const evaluationPromises = answers.map(async (answer) => {
            const evaluation = await evaluateAnswer(answer.questionId, answer.answer);

            return prisma.quizResponse.create({
                data: {
                    attemptId: attempt.id,
                    questionId: answer.questionId,
                    userAnswer: answer.answer,
                    isCorrect: evaluation.isCorrect,
                    feedback: evaluation.feedback
                }
            });
        });

        await Promise.all(evaluationPromises);

        const responses = await prisma.quizResponse.findMany({
            where: { attemptId: attempt.id }
        });

        const correctCount = responses.filter(r => r.isCorrect).length;
        const score = (correctCount / quiz.questions.length) * 100;

        await prisma.quizAttempt.update({
            where: { id: attempt.id },
            data: {
                score,
                completedAt: new Date()
            }
        });

        const report = await generatePerformanceReport(attempt.id);

        return {
            attempt: {
                id: attempt.id,
                score,
                report
            }
        };
    } catch (error) {
        console.error('Error submitting quiz attempt:', error);
        throw new Error(`Failed to submit quiz attempt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function generatePerformanceReport(attemptId: string) {
    try {
        // Get attempt with responses and questions
        const attempt = await prisma.quizAttempt.findUnique({
            where: { id: attemptId },
            include: {
                responses: {
                    include: {
                        question: true
                    }
                },
                quiz: true
            }
        });

        if (!attempt) {
            throw new Error('Quiz attempt not found');
        }

        // Calculate score
        const correctCount = attempt.responses.filter(r => r.isCorrect).length;
        const overallScore = (correctCount / attempt.totalQuestions) * 100;

        // Group by topic
        const topicPerformance: TopicPerformance = attempt.responses.reduce((acc: TopicPerformance, response) => {
            const topic = response.question.topic || 'General';
            if (!acc[topic]) {
                acc[topic] = { correct: 0, total: 0 };
            }
            acc[topic].total += 1;
            if (response.isCorrect) {
                acc[topic].correct += 1;
            }
            return acc;
        }, {});

        // Identify strengths and weaknesses
        const strengthTopics: string[] = [];
        const weaknessTopics: string[] = [];

        Object.entries(topicPerformance).forEach(([topic, { correct, total }]) => {
            const score = (correct / total) * 100;
            if (score >= 70) {
                strengthTopics.push(topic);
            } else {
                weaknessTopics.push(topic);
            }
        });

        // Generate AI recommendations
        let recommendations: string[] = [];
        if (weaknessTopics.length > 0) {
            const prompt = `
Based on a quiz on ${attempt.quiz.title}, the student performed well in these topics: ${strengthTopics.join(', ')}.
They need improvement in these topics: ${weaknessTopics.join(', ')}.
Their overall score was ${overallScore.toFixed(1)}%.

Provide 3-5 specific learning recommendations to help improve in the weak areas.
Format as a JSON array of strings: ["Recommendation 1", "Recommendation 2", ...]
`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON array - using safer regex without /s flag
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[0]);
            } else {
                recommendations = weaknessTopics.map(topic =>
                    `Review materials related to ${topic} to improve your understanding.`
                );
            }
        } else {
            recommendations = ["Great job! Continue practicing to maintain your knowledge."];
        }

        // Create and return report
        const report = await prisma.performanceReport.create({
            data: {
                attemptId: attempt.id,
                overallScore,
                strengthTopics: strengthTopics as string[],
                weaknessTopics,
                recommendations
            }
        });

        return report;
    } catch (error) {
        console.error('Error generating performance report:', error);
        throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getQuizById(quizId: string) {
    try {
        return await prisma.quiz.findUnique({
            where: { id: quizId },
            include: {
                questions: true
            }
        });
    } catch (error) {
        console.error('Error fetching quiz:', error);
        throw new Error(`Failed to fetch quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function getQuizAttempts(studentId: string, quizId?: string) {
    try {
        return await prisma.quizAttempt.findMany({
            where: {
                studentId,
                ...(quizId ? { quizId } : {})
            },
            include: {
                quiz: true,
                report: true
            },
            orderBy: {
                startedAt: 'desc'
            }
        });
    } catch (error) {
        console.error('Error fetching quiz attempts:', error);
        throw new Error(`Failed to fetch quiz attempts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getQuizByCourseId(courseId: string) {
    try {
        return await prisma.quiz.findMany({
            where: { courseId },
            include: {
                questions: true
            },
            orderBy: { id: 'desc' }
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw new Error(`Failed to fetch quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getQuizSubmissionsByCourseId(courseId: string, studentId: string) {
    try {
        // First get all quizzes for the course
        const quizzes = await prisma.quiz.findMany({
            where: { courseId },
            select: { id: true }
        });

        // Get the quiz IDs
        const quizIds = quizzes.map(quiz => quiz.id);

        // Get all quiz attempts for these quizzes by the student
        const submissions = await prisma.quizAttempt.findMany({
            where: {
                quizId: { in: quizIds },
                studentId: studentId
            },
            include: {
                quiz: true,
                report: true
            },
            orderBy: {
                completedAt: 'desc'
            }
        });

        return submissions;
    } catch (error) {
        console.error('Error fetching quiz submissions:', error);
        throw new Error(`Failed to fetch quiz submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getQuizes(){
    try {
        return await prisma.quiz.findMany({
            include: {
                questions: true
            }
        });
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        throw new Error(`Failed to fetch quizzes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getAllQuizSubmissions(){
    try {
        return await prisma.quizAttempt.findMany({
            include: {
                quiz: true,
                report: true
            }
        });
    } catch (error) {
        console.error('Error fetching all quiz submissions:', error);
        throw new Error(`Failed to fetch all quiz submissions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
export async function getQuestionsByQuizId(quizId: string) {
    try {
        return await prisma.question.findMany({
            where: { quizId }
        });
    } catch (error) {
        console.error('Error fetching questions:', error);
        throw new Error(`Failed to fetch questions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function updateQuestion(questionId: string, updateData: {
    question?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
    difficultyLevel?: DifficultyLevel;
    topic?: string;
    imageUrl?: string | null;
    codeSnippet?: string | null;
}) {
    try {
        return await prisma.question.update({
            where: { id: questionId },
            data: updateData
        });
    } catch (error) {
        console.error('Error updating question:', error);
        throw new Error(`Failed to update question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function deleteQuestion(questionId: string) {
    try {
        // Check if any responses exist for this question
        const responses = await prisma.quizResponse.findMany({
            where: { questionId }
        });

        if (responses.length > 0) {
            throw new Error('Cannot delete question with existing student responses');
        }

        return await prisma.question.delete({
            where: { id: questionId }
        });
    } catch (error) {
        console.error('Error deleting question:', error);
        throw new Error(`Failed to delete question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

export async function addQuestionToQuiz(quizId: string, questionData: QuestionData) {
    try {
        return await prisma.question.create({
            data: {
                ...questionData,
                quizId
            }
        });
    } catch (error) {
        console.error('Error adding question to quiz:', error);
        throw new Error(`Failed to add question: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}