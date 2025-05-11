"use client"
import { createContext, ReactNode, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import {jwtDecode} from 'jwt-decode';

interface Mentor {
    id: string;
    name: string;
    email: string;
    role: 'MENTOR';
    createdAt: Date;
}

interface MentorContextType {
    backendUrl: string;
    setMentorData: (data: Mentor) => void;
    mentorData: Mentor | null;
    setMentorToken: (token: string) => void;
    mentorToken: string;
    isMentorAuthenticated: boolean;
    mentorLogout: () => void;
    refreshMentorData: () => Promise<Mentor | null>;
}

interface MentorContextProviderProps {
    children: ReactNode;
}

export const MentorContext = createContext<MentorContextType | undefined>(undefined);

const MentorContextProvider = (props: MentorContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [mentorData, setMentorData] = useState<Mentor | null>(null);
    const [mentorToken, setMentorToken] = useState('');
    const [isMentorAuthenticated, setIsMentorAuthenticated] = useState(false);
    const router = useRouter();

    const REFRESH_INTERVAL = 30000;

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decodedToken: any = jwtDecode(storedToken);
            if (decodedToken.exp * 1000 < Date.now()) {
                mentorLogout();
            } else {
                setMentorToken(storedToken);
                setIsMentorAuthenticated(true);
                Cookies.set('token', storedToken, { expires: 7 });
                getMentorData(storedToken);
            }
        }
    }, []);

    const handleSetMentorToken = (newToken: string) => {
        setMentorToken(newToken);
        setIsMentorAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 3/24 });
        getMentorData(newToken);
        router.push('/mentor/dashboard');
    };

    const mentorLogout = () => {
        setMentorToken('');
        setIsMentorAuthenticated(false);
        setMentorData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        router.push('/mentor/sign-in');
    };

    const getMentorData = async (currentToken: string = mentorToken): Promise<Mentor | null> => {
        if (!currentToken) return null;

        try {
            const response = await axios.get(`${backendUrl}/mtr/getMentor`, {
                headers: {
                    token: currentToken
                }
            });
            setMentorData(response.data);
            return response.data;
        } catch (e) {
            console.error(e);
            if (axios.isAxiosError(e) && e.response?.status === 401) {
                mentorLogout();
            }
            return null;
        }
    };

    const refreshMentorData = async (): Promise<Mentor | null> => {
        return await getMentorData();
    };

    useEffect(() => {
        if (mentorToken) {
            getMentorData();
        }
    }, [mentorToken]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        if (mentorToken) {
            intervalId = setInterval(() => {
                getMentorData();
            }, REFRESH_INTERVAL);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [mentorToken]);

    const value = {
        backendUrl,
        mentorData,
        setMentorData,
        setMentorToken: handleSetMentorToken,
        mentorToken,
        isMentorAuthenticated,
        mentorLogout,
        refreshMentorData
    };

    return (
        <MentorContext.Provider value={value}>
            {props.children}
        </MentorContext.Provider>
    );
};

export default MentorContextProvider;