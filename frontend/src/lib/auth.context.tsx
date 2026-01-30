import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from './api';

// Helper to decode JWT manually without extra libs for now
const decodeJwt = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            window.atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (e) {
        return null;
    }
};

interface User {
    id: string;
    email: string;
    tenantId: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check for existing token on mount
        const token = localStorage.getItem('accessToken');
        if (token) {
            const decoded = decodeJwt(token);
            if (decoded) {
                // Our JWT payload structure might vary, adapting to standard standard
                setUser({
                    id: decoded.sub || decoded.id,
                    email: decoded.email,
                    tenantId: decoded.tenantId,
                });
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // Adjust endpoint if needed. Based on our backend, it's /iam/login
            const response = await api.post('/iam/login', { email, password });
            const { accessToken } = response.data;

            if (accessToken) {
                localStorage.setItem('accessToken', accessToken);

                const decoded = decodeJwt(accessToken);
                if (decoded) {
                    setUser({
                        id: decoded.sub,
                        email: decoded.email,
                        tenantId: decoded.tenantId,
                    });
                }
            }
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
