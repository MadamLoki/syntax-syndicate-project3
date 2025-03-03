import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface AuthContextType {
    isLoggedIn: boolean;
    user: UserData | null;
    login: (token: string) => void;
    logout: () => void;
    getToken: () => string | null;
}

interface UserData {
    _id: string;
    username: string;
    email: string;
}

interface UserToken {
    exp: number;
    data?: UserData; // The data field may contain the user info
    _id?: string;    // Or it might be directly in the token
    username?: string;
    email?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
    const [user, setUser] = useState<UserData | null>(null);

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
                    setUser(null);
                } else {
                    // Extract user data from token
                    const userData = decoded.data && decoded.data._id ? decoded.data : {
                        _id: decoded._id || '',
                        username: decoded.username || '',
                        email: decoded.email || ''
                    };
                    
                    // Make sure we have the required user data
                    if (userData._id) {
                        setUser(userData);
                        setIsLoggedIn(true);
                    } else {
                        console.error('Invalid token format: missing user data');
                        localStorage.removeItem('id_token');
                        setIsLoggedIn(false);
                        setUser(null);
                    }
                }
            } catch (error) {
                // Invalid token format
                console.error('Error decoding token:', error);
                localStorage.removeItem('id_token');
                setIsLoggedIn(false);
                setUser(null);
            }
        }
    }, []);

    const login = (token: string) => {
        try {
            // Verify token format before saving
            const decoded = jwtDecode<UserToken>(token);
            
            // Extract user data
            const userData = decoded.data || {
                _id: decoded._id || '',
                username: decoded.username || '',
                email: decoded.email || ''
            };
            
            // Make sure we have the required user data
            if (!userData._id) {
                throw new Error('Invalid token format: missing user ID');
            }
            
            // Save token and update state
            localStorage.setItem('id_token', token);
            setUser(userData);
            setIsLoggedIn(true);
            
            console.log('User successfully logged in:', userData);
        } catch (error) {
            console.error('Invalid token format:', error);
            alert('Login failed. Please try again.');
        }
    };

    const logout = () => {
        localStorage.removeItem('id_token');
        setIsLoggedIn(false);
        setUser(null);
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
                setUser(null);
                return null;
            }

            return token;
        } catch {
            localStorage.removeItem('id_token');
            setIsLoggedIn(false);
            setUser(null);
            return null;
        }
    };

    return (
        <AuthContext.Provider value={{ isLoggedIn, user, login, logout, getToken }}>
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