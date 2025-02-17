import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';

import initializeSchema from './dbschema/schema.js';

const MONGODB_URI = process.env.MONGODB_URI || '';

const db = async (): Promise<typeof mongoose.connection> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Database connected.');
    
    await initializeSchema();
    console.log('Database schema initialized.');
    
    return mongoose.connection;
  } catch (error) {
    console.error('Database connection error:', error);
    throw new Error('Database connection failed.');
  }
};

export default db;
