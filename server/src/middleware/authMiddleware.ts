// server/src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Extend Express Request to include user
declare global {
    namespace Express {
        interface Request {
            user: {
                _id: unknown;
                username: string;
                email: string;
            };
        }
    }
}

/**
 * Authentication middleware that validates JWT tokens
 * If a valid token is found, adds the user data to the request object
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    // Get token from header
    const authHeader = req.headers.authorization;
    let token;

    // Check if auth header exists and follows Bearer schema
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    // If no token found, continue without setting user (will be handled by route)
    if (!token) {
        return next();
    }

    try {
        // Verify token
        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
            console.error('JWT_SECRET_KEY not defined in environment');
            return next();
        }

        // Decode token and add user data to request
        const decoded = jwt.verify(token, secret);
        req.user = decoded as { _id: unknown; username: string; email: string };

        next();
    } catch (error) {
        // Invalid token, continue without setting user
        console.error('Token verification failed:', error);
        next();
    }
};

export default authMiddleware;