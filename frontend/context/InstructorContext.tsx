"use client"
import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

interface Instructor {
    id: string;
    name: string;
    email: string;
    role: 'INSTRUCTOR';
    createdAt: Date;
    branch: string;
    image: string;
    createdCourses: string[];
    courses: Course[];
    course: Course
}

interface InstructorContextType {
    backendUrl: string;
    setInstructorData: (data: Instructor) => void;
    instructorData: Instructor | null;
    setInstructorToken: (token: string) => void;
    instructorToken: string;
    isInstructorAuthenticated: boolean;
    instructorLogout: () => void;
    refreshInstructorData: () => Promise<Instructor | null>;
    courses: Course[];
    getCourses: () => Promise<Course[]>;
    isLoading: boolean;
    quizAttempts: Record<string, QuizAttempt[]>;
    getQuizAttempts: () => Promise<void>;
}

interface InstructorContextProviderProps {
    children: ReactNode;
}

export const InstructorContext = createContext<InstructorContextType | undefined>(undefined);

export interface Course {
    id: string;
    title: string;
    description: string;
    image: string;
    instructorId: string;
    isApproved: boolean;
    courseContent: Chapter[];
    type: string;
    duration: string;
    difficulty: string;
}

export interface Chapter {
    id: string;
    order: number;
    title: string;
    lectures: Lecture[];
    courseId: string;
}

export interface Lecture {
    id: string;
    title: string;
    duration: number;
    order: number;
    chapterId: string;
    resourceType: string;
    resourceUrl?: string;
    flagged: boolean;
    requiresSubmission: boolean;
    lectureDuration?: number;
}
export interface QuizAttempt {
    id: string;
    quizId: string;
    studentId: string;
    startedAt: Date;
    completedAt: Date | null;
    score: number | null;
    status: 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED';
}
const InstructorContextProvider = (props: InstructorContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [instructorData, setInstructorData] = useState<Instructor | null>(null);
    const [instructorToken, setInstructorToken] = useState('');
    const [isInstructorAuthenticated, setIsInstructorAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt[]>>({});
    const REFRESH_INTERVAL = 30000;

    // Initialize context by checking for stored token
    useEffect(() => {
        const initializeContext = async () => {
            setIsLoading(true);

            if (!instructorToken) {
                const storedToken = localStorage.getItem('token');
                if (storedToken) {
                    try {
                        const decodedToken: any = jwtDecode(storedToken);
                        if (decodedToken.exp * 1000 < Date.now()) {
                            await instructorLogout();
                        } else {
                            setInstructorToken(storedToken);
                            setIsInstructorAuthenticated(true);
                            Cookies.set('token', storedToken, { expires: 7 });

                            // Fetch initial data with the stored token
                            await Promise.all([
                                getInstructorData(storedToken),
                                getCourses(storedToken)
                            ]);
                        }
                    } catch (error) {
                        console.error("Error initializing context:", error);
                        await instructorLogout();
                    }
                }
            } else {
                // If token is already set, fetch data
                await Promise.all([
                    getInstructorData(instructorToken),
                    getCourses(instructorToken)
                ]);
            }

            setIsLoading(false);
        };

        initializeContext();
    }, [instructorToken]);

    const handleSetInstructorToken = (newToken: string) => {
        setIsLoading(true);
        setInstructorToken(newToken);
        setIsInstructorAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 3 / 24 });

        // Data will be fetched by the useEffect that depends on instructorToken
        router.push('/instructor/dashboard');
    };

    const instructorLogout = async () => {
        setInstructorToken('');
        setIsInstructorAuthenticated(false);
        setInstructorData(null);
        setCourses([]);
        localStorage.removeItem('token');
        Cookies.remove('token');
        router.push('/instructor/sign-in');
    };

    const getInstructorData = async (currentToken: string = instructorToken): Promise<Instructor | null> => {
        if (!currentToken) return null;
        setIsLoading(true);

        try {
            const response = await axios.get(`${backendUrl}/ins/getInstructorProfile`, {
                headers: {
                    token: currentToken
                }
            });

            if (response.data) {
                setInstructorData(response.data);
                return response.data;
            }
            return null;
        } catch (e) {
            console.error("Error fetching instructor data:", e);
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                await instructorLogout();
            }
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    const getCourses = async (currentToken: string = instructorToken): Promise<Course[]> => {
        if (!currentToken) return [];
        setIsLoading(true);

        try {
            const response = await axios.get(`${backendUrl}/ins/getInstructorCourses`, {
                headers: {
                    token: currentToken
                }
            });

            // Check if response has data field (pagination) or is the direct array
            const coursesData = response.data.data ? response.data.data : response.data;
            setCourses(coursesData);
            return coursesData;
        } catch (e: any) {
            console.error("Failed to fetch instructor courses:", e);
            if (e.response && e.response.status === 401) {
                await instructorLogout();
            }
            setCourses([]);
            return [];
        } finally {
            setIsLoading(false);
        }
    };

    const getQuizAttempts = async (currentToken: string = instructorToken): Promise<void> => {
        if (!currentToken) return;
        setIsLoading(true);

        try {
            const response = await axios.get(`${backendUrl}/ins/getAttempts`, {
                headers: {
                    token: currentToken
                }
            });
            console.info(response.data);

            if (response.data) {
                const attemptsArray = Array.isArray(response.data)
                    ? response.data
                    : response.data.attempts || response.data.data || [];

                const attemptsByQuiz: Record<string, QuizAttempt[]> = {};

                attemptsArray.forEach((attempt: QuizAttempt) => {
                    if (!attemptsByQuiz[attempt.quizId]) {
                        attemptsByQuiz[attempt.quizId] = [];
                    }
                    attemptsByQuiz[attempt.quizId].push(attempt);
                });

                setQuizAttempts(attemptsByQuiz);
            }
        } catch (e) {
            console.error("Error fetching quiz attempts:", e);
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                await instructorLogout();
            }
        } finally {
            setIsLoading(false);
        }
    };
    const refreshInstructorData = async (): Promise<Instructor | null> => {
        setIsLoading(true);
        try {
            const [instructorData, coursesData] = await Promise.all([
                getInstructorData(),
                getCourses()
            ]);
            return instructorData;
        } catch (error) {
            console.error("Error refreshing data:", error);
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // Set up automatic refresh of data
    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (instructorToken) {
            intervalId = setInterval(() => {
                refreshInstructorData().catch(console.error);
            }, REFRESH_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [instructorToken]);

    const value = {
        backendUrl,
        instructorData,
        setInstructorData,
        setInstructorToken: handleSetInstructorToken,
        instructorToken,
        isInstructorAuthenticated,
        instructorLogout,
        refreshInstructorData,
        courses,
        getCourses,
        isLoading,
        quizAttempts,
        getQuizAttempts
    };

    return (
        <InstructorContext.Provider value={value}>
            {props.children}
        </InstructorContext.Provider>
    );
};

export default InstructorContextProvider;