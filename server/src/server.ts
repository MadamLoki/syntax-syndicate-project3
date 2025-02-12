import express from 'express';
import path from 'node:path';
//import { fileURLToPath } from 'node:url';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


import db from './config/connection.js';
import typeDefs from './schema/typeDefs.js';
import mergedResolvers from './resolvers/index.js';


// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

const getUserFromToken = (access_token: string) => {
    try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        return jwt.verify(access_token, secret);
    } catch (err) {
        console.error(err);
        return null;
    }
};

const startApolloServer = async () => {
    const server = new ApolloServer({ 
        typeDefs, 
        resolvers: mergedResolvers, 
        context: async ({ req }: { req: express.Request }) => {
            const token = req.headers.authorization || '';
            const user = getUserFromToken(token);
            return { user };
        }
    });

    await server.start();
    console.log('Apollo Server started');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    // Apply Apollo Server middleware
    server.applyMiddleware({ app: app as any });

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../../client/dist')));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
        });
    }

    try {
        await db();
        console.log('MongoDB connection established');
        
        app.listen(PORT, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
};

startApolloServer();