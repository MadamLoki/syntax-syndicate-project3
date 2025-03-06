import { IResolvers } from '@graphql-tools/utils';
import Thread from '../models/Threads';
import Comment from '../models/comment';
import Profile from '../models/Profile';
import { uploadImage } from '../config/cloudinary';
import { AuthenticationError } from '../utils/auth';
import { ObjectId } from 'mongoose';

const threadResolvers: IResolvers = {
  Query: {
    threads: async (_, __, context) => {
      try {
        // Ensure the user is authenticated
        if (!context.user) {
          throw new AuthenticationError('You must be authenticated to view threads');
        }

        const threads = await Thread.find()
          .populate({ path: 'author', model: 'Profile', select: 'username email' })
          .lean();

        return threads.map(thread => ({
          id: thread._id.toString(),
          title: thread.title,
          content: thread.content,
          threadType: thread.threadType,
          pet: {
            name: thread.pet.name,
            species: thread.pet.species,
            breed: thread.pet.breed,
            age: thread.pet.age,
            description: thread.pet.description,
            image: thread.pet.image,
          },
          author: {
            _id: thread.author._id.toString(),
            username: thread.author.username,
            email: thread.author.email,
          },
          comments: [], // Comments can be fetched separately if needed
          createdAt: thread.createdAt.toISOString(),
          updatedAt: thread.updatedAt.toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw new Error('Failed to fetch threads');
      }
    },
    thread: async (_, { id }: { id: string }, context) => {
      try {
        if (!context.user) {
          throw new AuthenticationError('You must be authenticated to view a thread');
        }

        const thread = await Thread.findById(id)
          .populate({ path: 'author', model: 'Profile', select: 'username email' })
          .lean();

        if (!thread) throw new Error('Thread not found');

        const comments = await Comment.find({ thread: id })
          .populate({ path: 'author', select: 'username email' })
          .lean();
        console.log(comments);
        return {
          id: thread._id.toString(),
          title: thread.title,
          content: thread.content,
          threadType: thread.threadType,
          pet: {
            name: thread.pet.name,
            species: thread.pet.species,
            breed: thread.pet.breed,
            age: thread.pet.age,
            description: thread.pet.description,
            image: thread.pet.image,
          },
          author: {
            _id: thread.author._id.toString(),
            username: thread.author.username,
            email: thread.author.email,
          },
         /* comments: comments.map(comment => ({
            id: comment._id.toString(),
            content: comment.content,
            author: {
              _id: comment.author._id.toString(),
              username: comment.author.username,
              email: comment.author.email,
            },
            createdAt: comment.createdAt.toISOString(),
          })),*/
          createdAt: thread.createdAt.toISOString(),
          updatedAt: thread.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error fetching thread:', error);
        throw new Error('Failed to fetch thread');
      }
    }
  },
  Mutation: {
    createThread: async (_, { input }: { input: any }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a thread');
      }

      try {
        // If a pet image is provided as a base64 string, upload it to Cloudinary
        let petImageUrl = input.pet.image;
        if (input.pet.image && input.pet.image.startsWith('data:')) {
          const uploadResult = await uploadImage(input.pet.image, 'forum-pets');
          petImageUrl = uploadResult.url;
        }

        const newThread = new Thread({
          title: input.title,
          content: input.content,
          threadType: input.threadType,
          pet: {
            ...input.pet,
            image: petImageUrl,
          },
          author: context.user._id,
        });

        const savedThread:any = await newThread.save();

        // Retrieve the full profile to get the user's username and email
        const profile = await Profile.findById(context.user._id);

        return {
          id: savedThread._id.toString(),
          title: savedThread.title,
          content: savedThread.content,
          threadType: savedThread.threadType,
          pet: {
            name: savedThread.pet.name,
            species: savedThread.pet.species,
            breed: savedThread.pet.breed,
            age: savedThread.pet.age,
            description: savedThread.pet.description,
            image: savedThread.pet.image,
          },
          author: {
            _id: context.user._id.toString(),
            username: profile?.username || '',
            email: profile?.email || '',
          },
          comments: [],
          createdAt: savedThread.createdAt.toISOString(),
          updatedAt: savedThread.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error creating thread:', error);
        throw new Error('Failed to create thread');
      }
    },
    createComment: async (_, { input }: { input: any }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to comment');
      }

      try {
        const thread:any = await Thread.findById(input.threadId);
        if (!thread) throw new Error('Thread not found');

        // Retrieve user profile for author details
        const profile = await Profile.findById(context.user._id);

        const newComment = new Comment({
          thread: input.threadId,
          content: input.content,
          author: context.user._id,
          parentComment: input.parentCommentId || undefined,
        });

        const savedComment:any = await newComment.save();

        return {
          id: savedComment._id.toString(),
          thread: {
            id: thread._id.toString(),
          },
          content: savedComment.content,
          author: {
            _id: context.user._id.toString(),
            username: profile?.username || '',
            email: profile?.email || '',
          },
          parentComment: input.parentCommentId ? { id: input.parentCommentId } : null,
          createdAt: savedComment.createdAt.toISOString(),
          updatedAt: savedComment.updatedAt.toISOString(),
        };
      } catch (error) {
        console.error('Error creating comment:', error);
        throw new Error('Failed to create comment');
      }
    }
  }
};

export default threadResolvers;