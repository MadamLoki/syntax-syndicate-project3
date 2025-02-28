import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createPetfinderAPI } from './routes/api/petFinderApi.js';

// Import middleware and routes
import authMiddleware from './middleware/authMiddleware.js';
import uploadRoutes from './routes/api/uploadRoutes.js';

import db from './config/connection.js';
import { mergeTypeDefs } from '@graphql-tools/merge';
import typeDefs from './typeDefs/typeDefs.js';
import ForumTypeDefs from './typeDefs/typeDefsForum.js';

const mergedTypeDefs = mergeTypeDefs([typeDefs, ForumTypeDefs]);
import mergedResolvers from './resolvers/index.js';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();

// Apply middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Apply authentication middleware to all routes
app.use(authMiddleware);

// Add the upload routes
app.use('/api', uploadRoutes);

// Existing Petfinder API setup
const petfinderAPI = createPetfinderAPI(
    process.env.PETFINDER_API_KEY || '',
    process.env.PETFINDER_SECRET || ''
);
console.log('API Key exists:', !!process.env.PETFINDER_API_KEY);
console.log('API Secret exists:', !!process.env.PETFINDER_SECRET);

app.get('/test-petfinder', async (_req, res) => {
    try {
        const types = await petfinderAPI.getTypes();
        res.json(types);
    } catch (error) {
        console.error('Petfinder API test failed:', error);
        res.status(500).json({ error: (error as any).message });
    }
});

// Add a debug endpoint that shows more information
app.get('/debug-petfinder', async (_req, res) => {
    try {
        const types = await petfinderAPI.getTypes();
        const searchResult = await petfinderAPI.searchPets({
            type: 'Dog',
            limit: 1
        });
        res.json({
            types,
            searchSample: searchResult
        });
    } catch (error) {
        console.error('Debug endpoint error:', error);
        res.status(500).json({
            error: (error as any).message,
            stack: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
        });
    }
});

app.use('/graphql', express.json());
app.use('/graphql', (req, _res, next) => {
    // console.log('GraphQL Request Body:', req.body);
    next();
});

const getUserFromToken = (authHeader: string) => {
    try {
        const token = authHeader.split(' ')[1];
        if (!token) return null;

        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
            console.error('JWT_SECRET_KEY is not defined');
            return null;
        }
        
        return jwt.verify(token, secret);
    } catch (err) {
        if (err instanceof jwt.TokenExpiredError) {
            // Token is expired, return null instead of throwing
            console.log('Token expired, user will need to login again');
            return null;
        }
        console.error('Token verification error:', err);
        return null;
    }
};

const startApolloServer = async () => {
    // Test Petfinder API connection
    try {
        console.log('Testing Petfinder API connection...');
        const testTypes = await petfinderAPI.getTypes();
        console.log('Petfinder API test successful');
    } catch (error) {
        console.error('Failed to initialize Petfinder API:', error);
    }

    const server = new ApolloServer({ 
        typeDefs, 
        resolvers: mergedResolvers,
        persistedQueries: false,
        context: async ({ req }: { req: express.Request }) => {
            const token = req.headers.authorization || '';
            const user = getUserFromToken(token);
            // Even if user auth fails, we still want to allow access to public queries
            return { 
                user,
                petfinderAPI
            };
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