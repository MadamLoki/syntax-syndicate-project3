// seedThreads.ts
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Thread from '../models/Threads'; // Adjust path if necessary
import db from '../config/connection';  // Your DB connection module

dotenv.config();

const seedThreads = async () => {
  try {
    // Ensure database connection is established
    await db();
    console.log('MongoDB connected for seeding threads.');

    // Optional: clear existing threads
    await Thread.deleteMany({});
    console.log('Existing threads removed.');

    // Example threads data
    const sampleThreads = [
      {
        title: 'Looking to Adopt a Friendly Dog',
        content: 'I am looking for a gentle, family-friendly dog. Preferably medium-sized and well-trained.',
        threadType: 'ADOPTION',
        pet: {
          name: 'Buddy',
          species: 'Dog',
          breed: 'Labrador Retriever',
          age: 3,
          description: 'A friendly and playful Labrador looking for a loving home.',
          image: 'https://example.com/images/buddy.jpg' // Replace with a valid URL or a base64 string if needed
        },
        // For seeding, we’re using a dummy ObjectId.
        // In a real-world scenario, this should reference an existing user.
        author: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: 'Giving Up My Cat for Adoption',
        content: 'Due to personal circumstances, I need to give up my cat. She is very affectionate and indoor-only.',
        threadType: 'SURRENDER',
        pet: {
          name: 'Whiskers',
          species: 'Cat',
          breed: 'Siamese',
          age: 5,
          description: 'A loving and sociable cat who gets along with everyone.',
          image: 'https://example.com/images/whiskers.jpg'
        },
        author: new mongoose.Types.ObjectId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Add additional sample threads as needed
    ];

    const createdThreads = await Thread.insertMany(sampleThreads);
    console.log(`Inserted ${createdThreads.length} threads.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding threads:', error);
    process.exit(1);
  }
};

seedThreads();
