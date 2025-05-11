"use client"
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { AlertCircle, CheckCircle, X } from 'lucide-react';

type NotificationType = 'success' | 'error';

interface NotificationContextType {
    showNotification: (message: string, type: NotificationType) => void;
    hideNotification: () => void;
}

interface NotificationProviderProps {
    children: ReactNode;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
    const [notification, setNotification] = useState<{
        message: string;
        type: NotificationType;
        visible: boolean;
    }>({ message: '', type: 'success', visible: false });

    const showNotification = (message: string, type: NotificationType) => {
        setNotification({ message, type, visible: true });
        setTimeout(() => {
            setNotification(prev => ({ ...prev, visible: false }));
        }, 3000);
    };

    const hideNotification = () => {
        setNotification(prev => ({ ...prev, visible: false }));
    };

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}
            {notification.visible && (
                <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
                    notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {notification.type === 'success' ?
                        <CheckCircle className="w-5 h-5 flex-shrink-0" /> :
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    }
                    <span className="flex-1">{notification.message}</span>
                    <button
                        onClick={hideNotification}
                        className="ml-2 p-1 hover:bg-gray-200 rounded-full flex items-center justify-center"
                        aria-label="Close notification"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};