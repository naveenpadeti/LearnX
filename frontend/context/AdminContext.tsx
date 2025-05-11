"use client"
import { createContext, ReactNode, useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from "axios";
import {jwtDecode} from 'jwt-decode';

interface Admin {
    name: string;
    email: string;
    role: 'ADMIN';
}
export interface User{
    id: string;
    name: string;
    email: string;
    role: 'USER' | 'INSTRUCTOR' | 'MENTOR';
    imageUrl: string;
}
export interface Course{
    chapters: number;
    id: string;
    title: string;
    description: string;
    image: string;
    isApproved: boolean;
}
interface AdminContextType {
    backendUrl: string;
    setAdminData: (data: Admin) => void;
    adminData: Admin | null;
    setAdminToken: (token: string) => void;
    adminToken: string;
    isAdminAuthenticated: boolean;
    adminLogout: () => void;
    users: User[];
    courses: Course[];
    setCourses: (courses: Course[]) => void;
}

interface AdminContextProviderProps {
    children: ReactNode;
}

export const AdminContext = createContext<AdminContextType | undefined>(undefined);

const AdminContextProvider = (props: AdminContextProviderProps) => {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:9000";
    const [adminData, setAdminData] = useState<Admin | null>(null);
    const [adminToken, setAdminToken] = useState('');
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            const decodedToken: any = jwtDecode(storedToken);
            if (decodedToken.exp * 1000 < Date.now()) {
                adminLogout();
            } else {
                setAdminToken(storedToken);
                setIsAdminAuthenticated(true);
                Cookies.set('token', storedToken, { expires: 3/24 });
                getUsers();
                getCourses();
            }
        }
    }, []);

    const getUsers = async () => {
        try {
            const response = await axios.get(`${backendUrl}/admin/getUsers`, {
                headers: {
                    token: adminToken
                }
            });
            setUsers(response.data);
        } catch (e:any) {
            console.error("Failed to fetch users:", e);
            if (e.response && e.response.status === 401) {
                adminLogout();
            }
        }
    };

    const handleSetAdminToken = (newToken: string) => {
        setAdminToken(newToken);
        setIsAdminAuthenticated(true);
        localStorage.setItem('token', newToken);
        Cookies.set('token', newToken, { expires: 7 });
        router.push('/admin/dashboard');
    };

    const adminLogout = () => {
        setAdminToken('');
        setIsAdminAuthenticated(false);
        setAdminData(null);
        localStorage.removeItem('token');
        Cookies.remove('token');
        router.push('/admin/sign-in');
    };

    const getCourses = async () => {
        try {
            const response = await axios.get(`${backendUrl}/admin/getCourses`, {
                headers: {
                    token: adminToken
                }
            });
            setCourses(response.data);
        } catch (e:any) {
            console.error("Failed to fetch courses:", e);
            if (e.response && e.response.status === 401) {
                adminLogout();
            }
        }
    };

    const value = {
        backendUrl,
        adminData,
        setAdminData,
        setAdminToken: handleSetAdminToken,
        adminToken,
        isAdminAuthenticated,
        adminLogout,
        users,
        courses,
        setCourses
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;