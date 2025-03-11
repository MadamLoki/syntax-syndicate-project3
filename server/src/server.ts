import express from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { createPetfinderAPI } from './routes/api/petFinderApi.js';

// Import middleware and routes
import authMiddleware from './middleware/authMiddleware.js';
import uploadRoutes from './routes/api/uploadRoutes.js';

import db from './config/connection.js';

import typeDefs from './typeDefs/typeDefs.js';
import mergedResolvers from './resolvers/index.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '3001', 10);
const app = express();

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

// Add request parsing middleware
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));

// Add GraphQL-specific middleware
app.use('/graphql', express.json({ limit: '50mb' }));
app.use('/graphql', (req, _res, next) => {
    // console.log('GraphQL Request Body:', req.body);
    next();
});

// Add API routes for uploads
app.use('/api', uploadRoutes);

const getUserFromToken = (authHeader: string) => {
    try {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        
        const token = authHeader.split(' ')[1];
        if (!token) return null;

        const secret = process.env.JWT_SECRET_KEY;
        if (!secret) {
            console.error('JWT_SECRET_KEY is not defined');
            return null;
        }
        
        // Verify the token and extract the payload
        const decoded = jwt.verify(token, secret) as any;
        
        // For user data that may be nested inside a 'data' property
        const userData = decoded.data || decoded;
        
        // Log the user data for debugging
        // console.log('Token decoded user data:', userData);
        
        // Ensure the basic user fields are available
        if (!userData._id) {
            // console.warn('Decoded token lacks _id field:', userData);
        }
        
        return userData;
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
            //console.log('User from token:', user);
            return { 
                user,
                petfinderAPI
            };
        }
    });

    await server.start();
    console.log('Apollo Server started');

    // Apply Apollo Server middleware
    server.applyMiddleware({ app: app as any });

    // Production setup for static files
    if (process.env.NODE_ENV === 'production') {
        const staticPath = path.resolve('../client/dist');
        //console.log('Serving static files from:', staticPath);
        
        app.use(express.static(staticPath));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(staticPath, 'index.html'));
        });
    }

    try {
        await db();
        console.log('MongoDB connection established');
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        });
    } catch (error) {
        console.error('Server startup error:', error);
        process.exit(1);
    }
};

startApolloServer().catch(err => {
    console.error('Failed to start server:', err);
});