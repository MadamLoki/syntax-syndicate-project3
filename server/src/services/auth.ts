// import { Request } from 'express';
import jwt from 'jsonwebtoken';
import { ExpressContextFunctionArgument } from '@apollo/server/express4';
import dotenv from 'dotenv';

dotenv.config();

interface JwtPayload {
  _id: string;
  username: string;
  email: string;
}

export const authMiddleware = async ({ req }: ExpressContextFunctionArgument) => {
  let token = req.headers.authorization;

  if (token && token.startsWith('Bearer ')) {
    token = token.slice(7);
    try {
      const secretKey = process.env.JWT_SECRET_KEY || '';
      const user = jwt.verify(token, secretKey) as JwtPayload;
      return { user };
    } catch (err) {
      console.error('Invalid token');
      return { user: null };
    }
  }
  return { user: null };
};

export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';
  return jwt.sign(payload, secretKey, { expiresIn: '2h' });
};

export const AuthenticationError = new Error('You need to be logged in!');