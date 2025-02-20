import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    isLoggedIn: boolean;
    login: (token: string) => void;
    logout: () => void;
    getToken: () => string | null;
}

interface UserToken {
    exp: number;
    data: {
        _id: string;
        username: string;
        email: string;
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

    useEffect(() => {
        // Check token validity on mount
        const token = localStorage.getItem('id_token');
        if (token) {
            try {
                const decoded = jwtDecode<UserToken>(token);
                const isTokenValid = decoded.exp * 1000 > Date.now();

                if (!isTokenValid) {
                    // Token has expired, remove it
                    localStorage.removeItem('id_token');
                    setIsLoggedIn(false);
                } else {
                    setIsLoggedIn(true);
                }
            } catch (error) {
                // Invalid token format
                localStorage.removeItem('id_token');
                setIsLoggedIn(false);
            }
        }
    }, []);

    const login = (token: string) => {
        localStorage.setItem('id_token', token);
        setIsLoggedIn(true);
    };

    const logout = () => {
        localStorage.removeItem('id_token');
        setIsLoggedIn(false);
        // Optional: Redirect to login page
        window.location.assign('/login');
    };

    const getToken = () => {
        const token = localStorage.getItem('id_token');
        if (!token) return null;

        try {
            const decoded = jwtDecode<UserToken>(token);
            const isTokenValid = decoded.exp * 1000 > Date.now();

            if (!isTokenValid) {
                localStorage.removeItem('id_token');
                setIsLoggedIn(false);
                return null;
            }

            return token;
        } catch {
            localStorage.removeItem('id_token');
            setIsLoggedIn(false);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, login, logout, getToken }}>
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