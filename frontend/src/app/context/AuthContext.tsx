import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../services/api';

interface User {
    id: string;
    username: string;
    email: string;
    avatar: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    login: (credentials: any) => Promise<void>;
    register: (userData: any) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const userData = await auth.getMe(token);
                // Ensure avatar has a default if missing
                if (!userData.avatar) userData.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
                setUser(userData);
            } catch (err) {
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setIsLoading(false);
    };

    const login = async (credentials: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await auth.login(credentials);
            localStorage.setItem('token', data.token);
            // Ensure avatar has a default if missing
            if (!data.avatar) data.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
            setUser(data);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (userData: any) => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await auth.register(userData);
            localStorage.setItem('token', data.token);
            // Ensure avatar has a default if missing
            if (!data.avatar) data.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop';
            setUser(data);
        } catch (err: any) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, error, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
