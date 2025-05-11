import { createContext, ReactNode, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { jwtDecode } from "jwt-decode";

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
    enrollments: Enrollment[];
    difficulty: string;
}

export interface Enrollment {
    id: string;
    studentId: string;
    courseId: string;
    progress: number;
    status: string;
}

export interface Chapter {
    id: string;
    chapterId?: string;
    title: string;
    courseId: string;
    order: number;
    content?: Lecture[];
    lectures?: Lecture[];
}

export interface Lecture {
    id: string;
    title: string;
    resourceType: string;
    resourceUrl: string;
    order: number;
    chapterId: string;
    duration?: number;
    lectureDuration: number;
    requiresSubmission: boolean;
}

export interface Assignment {
    id: string;
    title: string;
    description?: string;
    dueDate?: string;
    courseId: string;
    chapterId?: string;
}

export interface Submission {
    id: string;
    assignmentId: string;
    studentId: string;
    submissionUrl: string;
    submittedAt: Date;
    grade: number | null;
    feedback: string | null;
}

export interface Quiz {
    id: string;
    courseId: string;
    title: string;
    description?: string;
    questionType: string;
    questions: QuizQuestion[];
    dueDate?: string;
}

export interface QuizQuestion {
    id: string;
    quizId: string;
    text: string;
    options: string[];
    correctAnswer: string;
    order: number;
}

export interface QuizSubmission {
    result: any;
    attempt: any;
    id: string;
    quizId: string;
    studentId: string;
    answers: Record<string, string>;
    score: number;
    submittedAt: Date;
}

interface User {
    id: string;
    name: string;
    email: string;
    collegeID: string | null;
    role: 'INSTRUCTOR' | 'STUDENT';
    cgpa: number | null;
    phoneNo: string | null;
    address: string | null;
    dob: string | null;
    studentStatus: string | null;
    silPoints: number | null;
    image: string;
    year: number | null;
    semester: number | null;
    branch: string | null;
    createdAt: Date;
    courses: Course[];
}

interface AppContextType {
    backendUrl: string;
    setData: (data: User) => void;
    data: User | null;
    setToken: (token: string) => void;
    token: string;
    isAuthenticated: boolean;
    logout: () => void;
    refreshData: () => Promise<User | null>;
    courses: Course[];
    fetchCourses: () => Promise<void>;
    refreshCourses: () => Promise<void>;
    getEnrollments: () => Promise<void>;
    enrollments: Enrollment[];
    assignments: Record<string, Assignment[]>;
    submissions: Record<string, Submission>;
    fetchAssignments: (courseId: string) => Promise<Assignment[]>;
    fetchSubmissions: () => Promise<void>;
    submitAssignment: (assignmentId: string, file: File) => Promise<Submission>;
    quizzes: Record<string, Quiz[]>;
    quizSubmissions: Record<string, QuizSubmission>;
    fetchQuizzes: (courseId: string) => Promise<Quiz[]>;
    submitQuiz: (quizId: string, answers: { questionId: string; answer: string; }[]) => Promise<QuizSubmission>;
    quizAttempts: Record<string, QuizAttempt[]>;
    getQuizAttempts: () => Promise<void>;
    isLoading: boolean;
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
interface AppContextProviderProps {
    children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = (props: AppContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [data, setData] = useState<User | null>(null);
    const [token, setToken] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [assignments, setAssignments] = useState<Record<string, Assignment[]>>({});
    const [submissions, setSubmissions] = useState<Record<string, Submission>>({});
    const [quizzes, setQuizzes] = useState<Record<string, Quiz[]>>({});
    const [quizSubmissions, setQuizSubmissions] = useState<Record<string, QuizSubmission>>({});
    const [isInitialized, setIsInitialized] = useState(false);
    const [quizAttempts, setQuizAttempts] = useState<Record<string, QuizAttempt[]>>({});
    const [isLoading, setIsLoading] = useState(true);
    const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

    // Memoized token expiration check to prevent re-renders
    const isTokenExpired = useCallback((tokenToCheck: string) => {
        try {
            const decoded: any = jwtDecode(tokenToCheck);
            if (decoded.exp * 1000 < Date.now()) {
                return true;
            }
            return false;
        } catch {
            // If token can't be decoded, treat as expired
            return true;
        }
    }, []);

    // Memoized logout function to prevent dependency cycles
    const logout = useCallback(() => {
        setToken('');
        setIsAuthenticated(false);
        setData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        window.location.replace('/sign-in');
    }, []);

    // API request with auth header - memoized to prevent re-renders
    const authRequest = useCallback(async (method: 'get' | 'post', url: string, reqData?: any, headers?: any) => {
        const currentToken = token;
        if (!currentToken || isTokenExpired(currentToken)) {
            if (method === 'get') return null;
            throw new Error("Unauthorized");
        }

        try {
            const config = {
                headers: {
                    token: currentToken,
                    ...headers
                }
            };

            if (method === 'get') {
                return await axios.get(`${backendUrl}${url}`, config);
            } else {
                return await axios.post(`${backendUrl}${url}`, reqData, config);
            }
        } catch (error) {
            console.error(`Error in ${method} request to ${url}:`, error);
            if (axios.isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 403)) {
                logout();
            }
            throw error;
        }
    }, [backendUrl, token, isTokenExpired, logout]);

    // Get user profile data - memoized to prevent re-renders
    const getData = useCallback(async (): Promise<User | null> => {
        try {
            const response = await authRequest('get', '/api/getProfile');
            if (response) {
                setData(response.data);
                return response.data;
            }
            return null;
        } catch (e) {
            console.error("Error fetching user data:", e);
            return null;
        }
    }, [authRequest]);

    // Set token handler - memoized to prevent re-renders
    const handleSetToken = useCallback((newToken: string) => {
        setToken(newToken);
        setIsAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 3 / 24 }); // 3 hours
        setIsInitialized(false); // Force reinitialization
        router.push('/dashboard');
    }, [router]);

    // Fetch courses - memoized to prevent re-renders
    const fetchCourses = useCallback(async () => {
        try {
            const response = await authRequest('get', '/api/getCourses');
            if (response) setCourses(response.data);
        } catch (e) {
            console.error("Error fetching courses:", e);
        }
    }, [authRequest]);

    // Get enrollments - memoized to prevent re-renders
    const getEnrollments = useCallback(async () => {
        try {
            const response = await authRequest('get', '/api/getEnrollments');
            if (response) {
                setData((prevData) => {
                    if (prevData) {
                        return {
                            ...prevData,
                            courses: response.data
                        };
                    }
                    return prevData;
                });
                setEnrollments(response.data);
            }
        } catch (e) {
            console.error("Error fetching enrollments:", e);
        }
    }, [authRequest]);

    // Fetch assignments for a course - memoized to prevent re-renders
    const fetchAssignments = useCallback(async (courseId: string): Promise<Assignment[]> => {
        try {
            const response = await authRequest('get', `/api/getAssignments/${courseId}`);
            if (response) {
                setAssignments(prev => ({
                    ...prev,
                    [courseId]: response.data
                }));
                return response.data;
            }
            return [];
        } catch (e) {
            console.error("Error fetching assignments:", e);
            return [];
        }
    }, [authRequest]);

    // Fetch submissions - memoized to prevent re-renders
    const fetchSubmissions = useCallback(async () => {
        try {
            const response = await authRequest('get', '/api/submissions');
            if (response) {
                // Convert array to record keyed by assignmentId for easier lookup
                const submissionsMap = response.data.reduce((acc: Record<string, any>, submission: any) => {
                    acc[submission.assignmentId] = submission;
                    return acc;
                }, {});
                setSubmissions(submissionsMap);
            }
        } catch (e) {
            console.error("Error fetching submissions:", e);
        }
    }, [authRequest]);

    // Submit assignment - memoized to prevent re-renders
    const submitAssignment = useCallback(async (assignmentId: string, file: File): Promise<Submission> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('assignmentId', assignmentId);
        formData.append('studentId', data?.id ?? '');

        try {
            const response = await authRequest(
                'post',
                '/api/submitAssignment',
                formData,
                { 'Content-Type': 'multipart/form-data' }
            );

            if (response) {
                const newSubmission = response.data;
                setSubmissions(prev => ({
                    ...prev,
                    [assignmentId]: newSubmission
                }));
                return newSubmission;
            }
            throw new Error("Failed to submit assignment");
        } catch (error) {
            console.error("Error submitting assignment:", error);
            throw error;
        }
    }, [authRequest, data?.id]);
    const getQuizAttempts = useCallback(async () => {
        try {
            const response = await authRequest('get', '/api/getAttempts');
            if (response) {
                console.log("Quiz attempts response:", response.data);

                // Determine the correct data structure based on the response
                let attemptsArray;

                if (Array.isArray(response.data)) {
                    attemptsArray = response.data;
                } else if (response.data && typeof response.data === 'object') {
                    // Check possible locations of the attempts array
                    if (Array.isArray(response.data.attempts)) {
                        attemptsArray = response.data.attempts;
                    } else if (Array.isArray(response.data.data)) {
                        attemptsArray = response.data.data;
                    } else if (response.data.success && Array.isArray(response.data.quizAttempts)) {
                        attemptsArray = response.data.quizAttempts;
                    } else {
                        // If we can't find an array, create an empty one
                        console.error("Unexpected format from getAttempts API:", response.data);
                        attemptsArray = [];
                    }
                } else {
                    attemptsArray = [];
                }
                const attemptsByQuiz = attemptsArray.reduce((acc: Record<string, QuizAttempt[]>, attempt: QuizAttempt) => {
                    if (!acc[attempt.quizId]) {
                        acc[attempt.quizId] = [];
                    }
                    acc[attempt.quizId].push(attempt);
                    return acc;
                }, {});

                setQuizAttempts(attemptsByQuiz);
            }
        } catch (e) {
            console.error("Error fetching quiz attempts:", e);
        }
    }, [authRequest]);
    const fetchQuizzes = useCallback(async (courseId: string): Promise<Quiz[]> => {
        try {
            const response = await authRequest('get', `/api/getQuizes`);
            if (response && response.data.success) {
                // Store all quizzes in state without using courseId as keys
                setQuizzes(response.data.quizzes);

                // Still filter for the return value
                const courseQuizzes = response.data.quizzes.filter(
                    (quiz: Quiz) => quiz.courseId === courseId
                );

                return courseQuizzes;
            }
            return [];
        } catch (e) {
            console.error("Error fetching quizzes:", e);
            return [];
        }
    }, [authRequest]);

    const submitQuiz = useCallback(async (
        quizId: string,
        answers: { questionId: string; answer: string }[]
    ): Promise<QuizSubmission> => {
        try {
            const formattedAnswers = !Array.isArray(answers)
                ? Object.entries(answers).map(([questionId, answer]) => ({
                    questionId,
                    answer
                }))
                : answers;

            const response = await authRequest(
                'post',
                '/api/submitQuiz',
                {
                    quizId,
                    studentId: data?.id,
                    answers: formattedAnswers
                }
            );

            if (response) {
                const submission = response.data;
                setQuizSubmissions(prev => ({
                    ...prev,
                    [quizId]: submission
                }));
                console.log(submission);
                return submission;
            }
            throw new Error("Failed to submit quiz");
        } catch (error) {
            console.error("Error submitting quiz:", error);
            throw error;
        }
    }, [authRequest, data?.id]);

    // Refresh user data - memoized to prevent re-renders
    const refreshData = useCallback(async (): Promise<User | null> => {
        return await getData();
    }, [getData]);

    // Refresh all course-related data - memoized to prevent re-renders
    const refreshCourses = useCallback(async (): Promise<void> => {
        await fetchCourses();
        await getEnrollments();
        await fetchSubmissions();
        await getQuizAttempts();
        if (data?.courses) {
            const promises = data.courses.flatMap(course => [
                fetchAssignments(course.id),
                fetchQuizzes(course.id)
            ]);
            await Promise.allSettled(promises);
        }
    }, [fetchCourses, getEnrollments, fetchSubmissions, data?.courses, fetchAssignments, fetchQuizzes]);

    // Load stored token on mount (once)
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !isTokenExpired(storedToken)) {
            setToken(storedToken);
            setIsAuthenticated(true);
            Cookies.set('token', storedToken, { expires: 7 });
        } else if (storedToken) {
            // Token exists but is expired
            logout();
        }
    }, [isTokenExpired, logout]);

    // Initialize data fetch after token is set
    // Line ~370 in AppContext.tsx - Update the initialization useEffect
    useEffect(() => {
        if (token && !isInitialized) {
            setIsInitialized(true);
            setIsLoading(true);

            Promise.all([
                getData(),
                fetchCourses(),
                getEnrollments(),
                fetchSubmissions()
            ])
                .catch(error => {
                    console.error("Error during initialization:", error);
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }
    }, [token, isInitialized, getData, fetchCourses, getEnrollments, fetchSubmissions]);

    // Set up refresh intervals only after initialization
    useEffect(() => {
        if (token && isInitialized) {
            // Set up interval timers for refreshing data
            const profileIntervalId = setInterval(() => {
                getData().catch(console.error);
            }, REFRESH_INTERVAL);

            const resourcesIntervalId = setInterval(() => {
                refreshCourses().catch(console.error);
            }, REFRESH_INTERVAL * 2);

            // Cleanup on unmount or when dependencies change
            return () => {
                clearInterval(profileIntervalId);
                clearInterval(resourcesIntervalId);
            };
        }
    }, [token, isInitialized, getData, refreshCourses]);

    const value = {
        backendUrl,
        data,
        setData,
        setToken: handleSetToken,
        token,
        isAuthenticated,
        logout,
        refreshData,
        courses,
        fetchCourses,
        refreshCourses,
        getEnrollments,
        enrollments,
        assignments,
        submissions,
        fetchAssignments,
        fetchSubmissions,
        submitAssignment,
        quizzes,
        quizSubmissions,
        fetchQuizzes,
        submitQuiz,
        quizAttempts,
        getQuizAttempts,
        isLoading
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;