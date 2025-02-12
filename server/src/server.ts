import express from 'express';
import path from 'node:path';
import { ApolloServer } from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';

import db from './config/connection.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const app = express();


const startApolloServer = async () => {
    // await server.start();
    console.log('Apollo Server started');

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());

    if (process.env.NODE_ENV === 'production') {
        app.use(express.static(path.join(__dirname, '../../client/dist')));
        app.get('*', (_req, res) => {
            res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
        });
    }

    try {
        await new Promise<void>((resolve) => {
            db.once('open', () => {
                console.log('MongoDB connection established');
                app.listen(PORT, () => {
                    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
                    resolve();
                });
            });
        });
    } catch (error) {
        console.error('Server startup error:', error);
    }
};

startApolloServer();