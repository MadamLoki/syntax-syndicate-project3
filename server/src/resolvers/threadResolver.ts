import { IResolvers } from '@graphql-tools/utils';
import Thread from '../models/Threads';
import Comment from '../models/comment';
import Profile from '../models/Profile';
import { uploadImage } from '../config/cloudinary';
import { AuthenticationError } from '../utils/auth';
import { ObjectId } from 'mongoose';

// Define interfaces for raw mongoose documents
interface RawComment {
  _id: any;
  content?: any;
  thread?: any;
  author?: {
    _id?: any;
    username?: string;
    email?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
  parentComment?: any;
}

interface RawThread {
  _id: any;
  title?: string;
  content?: string;
  threadType?: string;
  pet?: {
    _id?: any;
    name?: string;
    species?: string;
    breed?: string;
    age?: number;
    description?: string;
    image?: string;
    owner?: any;
  };
  author?: {
    _id?: any;
    username?: string;
    email?: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
}

const threadResolvers: IResolvers = {
  Query: {
    threads: async (_, __, context) => {
      try {
        const threadsData = await Thread.find()
          .populate({ path: 'author', model: 'Profile', select: 'username email' })
          .lean();

        // Cast raw data to our interface to help TypeScript
        const threads = threadsData as unknown as RawThread[];

        console.log('Threads retrieved:', threads.map(t => ({
          id: t._id.toString(),
          hasAuthor: !!t.author,
          authorInfo: t.author ? `${t.author._id} - ${t.author.username}` : 'missing'
        })));

        return threads.map(thread => ({
          _id: thread._id.toString(),
          title: String(thread.title || ''),
          content: String(thread.content || ''),
          threadType: String(thread.threadType || ''),
          pet: thread.pet
            ? {
                _id: thread.pet._id ? thread.pet._id.toString() : "0",
                name: String(thread.pet.name || ''),
                species: String(thread.pet.species || ''),
                breed: String(thread.pet.breed || ''),
                age: Number(thread.pet.age || 0),
                description: String(thread.pet.description || ''),
                image: String(thread.pet.image || ''),
                owner: thread.pet.owner ? thread.pet.owner.toString() : "0",
              }
            : null,
          author: thread.author
            ? {
                _id: thread.author._id ? thread.author._id.toString() : "unknown-author-id",
                username: String(thread.author.username || 'Unknown'),
                email: String(thread.author.email || ''),
              }
            : {
                _id: "unknown-author-id",
                username: 'Unknown',
                email: '',
              },
          comments: [],
          createdAt: thread.createdAt ? thread.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: thread.updatedAt ? thread.updatedAt.toISOString() : new Date().toISOString(),
        }));
      } catch (error) {
        console.error('Error fetching threads:', error);
        throw new Error(`Failed to fetch threads: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    thread: async (_, { id }, context) => {
      try {
        const threadData = await Thread.findById(id)
          .populate({ path: 'author', model: 'Profile', select: 'username email' })
          .lean();

        if (!threadData) throw new Error(`Thread with ID ${id} not found`);
        
        // Cast raw thread data to our interface
        const thread = threadData as unknown as RawThread;
        
        console.log('Thread found:', {
          id: thread._id.toString(),
          title: thread.title,
          hasAuthor: !!thread.author
        });
        
        // Find comments for this thread
        const commentsData = await Comment.find({ thread: id })
          .populate({ path: 'author', model: 'Profile', select: 'username email' })
          .sort({ createdAt: 1 })
          .lean();
        
        // Cast raw comments to our interface
        const rawComments = commentsData as unknown as RawComment[];
        
        console.log(`Found ${rawComments.length} comments for thread ${id}`);
        
        // Map raw comments to properly typed objects
        const comments = rawComments.map(comment => ({
          _id: comment._id.toString(),
          // The key fix: explicitly handle content as a string
          content: String(comment.content || ''),
          author: {
            _id: comment.author && comment.author._id ? comment.author._id.toString() : 'unknown',
            username: String(comment.author?.username || 'Unknown'),
            email: String(comment.author?.email || ''),
          },
          createdAt: comment.createdAt ? comment.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: comment.updatedAt ? comment.updatedAt.toISOString() : new Date().toISOString(),
        }));

        // Return the thread with properly typed fields
        return {
          _id: thread._id.toString(),
          title: String(thread.title || ''),
          content: String(thread.content || ''),
          threadType: String(thread.threadType || ''),
          pet: thread.pet
            ? {
                _id: thread.pet._id ? thread.pet._id.toString() : null,
                name: String(thread.pet.name || ''),
                species: String(thread.pet.species || ''),
                breed: String(thread.pet.breed || ''),
                age: Number(thread.pet.age || 0),
                description: String(thread.pet.description || ''),
                image: String(thread.pet.image || ''),
                owner: thread.pet.owner ? thread.pet.owner.toString() : "unknown-owner-id",
              }
            : null,
          author: {
            _id: thread.author && thread.author._id ? thread.author._id.toString() : 'unknown',
            username: String(thread.author?.username || 'Unknown'),
            email: String(thread.author?.email || ''),
          },
          comments,
          createdAt: thread.createdAt ? thread.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: thread.updatedAt ? thread.updatedAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error fetching thread:', error);
        throw new Error(`Failed to fetch thread: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  },
  
  Mutation: {
     deleteThread: async (_, {threadId }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to delete a thread');
      }

      try{ 
        const thread = await Thread.findById(threadId);
        if (!thread) {
          throw new Error(`Thread not found`);
        }

        if (thread.author.toString() !== context.user._id.toString() ){
          throw new AuthenticationError('You can only delete your own threads');

      }

      await Comment.deleteMany({ thread: threadId });

      await Thread.findByIdAndDelete(threadId);

      return true;
    } catch (error) {
      console.error('Error deleting thread:', error);
      throw new Error(`Failed to delete thread: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
   


    createThread: async (_, { input }: { input: any }, context) => {
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to create a thread');
      }

      try {
        // Handle image upload
        let petImageUrl = input.pet.image;
        if (input.pet.image && input.pet.image.startsWith('data:')) {
          const uploadResult = await uploadImage(input.pet.image, 'forum-pets');
          petImageUrl = uploadResult.url;
        }

        // Create the thread with explicit owner
        const newThread = new Thread({
          title: input.title,
          content: input.content,
          threadType: input.threadType,
          pet: {
            ...input.pet,
            image: petImageUrl,
            owner: context.user._id
          },
          author: context.user._id,
        });

        const savedThreadData = await newThread.save();
        // Cast to raw thread type
        const savedThread = savedThreadData as unknown as RawThread & { _id: ObjectId };
        
        console.log('Thread created:', savedThread._id.toString());

        // Retrieve the author's profile
        const profile = await Profile.findById(context.user._id);
        
        // Log timestamps for debugging
        console.log('Saved thread timestamps:', {
          createdAt: savedThread.createdAt,
          updatedAt: savedThread.updatedAt
        });
        
        // Construct the response with proper types
        return {
          _id: savedThread._id.toString(),
          title: String(savedThread.title || ''),
          content: String(savedThread.content || ''),
          threadType: String(savedThread.threadType || ''),
          pet: {
            _id: savedThread.pet && savedThread.pet._id ? savedThread.pet._id.toString() : null,
            name: String(savedThread.pet?.name || ''),
            species: String(savedThread.pet?.species || ''),
            breed: String(savedThread.pet?.breed || ''),
            age: Number(savedThread.pet?.age || 0),
            description: String(savedThread.pet?.description || ''),
            image: String(savedThread.pet?.image || ''),
            owner: context.user._id.toString()
          },
          author: {
            _id: context.user._id.toString(),
            username: String(profile?.username || ''),
            email: String(profile?.email || ''),
          },
          comments: [],
          createdAt: savedThread.createdAt ? savedThread.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: savedThread.updatedAt ? savedThread.updatedAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error creating thread:', error);
        throw new Error(`Failed to create thread: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    
    createComment: async (_, { input }, context) => {
      // Check authentication
      if (!context.user) {
        throw new AuthenticationError('You must be logged in to comment');
      }
    
      try {
        const { threadId, content, parentCommentId } = input;
        
        // Log the input for debugging
        console.log('Creating comment with:', { 
          threadId, 
          content, 
          userId: context.user._id,
          parentCommentId: parentCommentId || 'none'
        });
        
        // Verify the thread exists
        const thread = await Thread.findById(threadId);
        if (!thread) {
          throw new Error(`Thread with ID ${threadId} not found`);
        }
        
        // Create comment document
        const newComment = new Comment({
          thread: threadId,
          content: content || '',
          author: context.user._id,
          ...(parentCommentId && { parentComment: parentCommentId })
        });
        
        // Save to database
        const savedCommentData = await newComment.save();
        // Cast to our raw comment type
        const savedComment = savedCommentData as unknown as RawComment & { _id: ObjectId };
        
        console.log('Comment created:', savedComment._id.toString());
        
        // Get author profile
        const profile = await Profile.findById(context.user._id);
        
        // Construct response with proper types
        return {
          _id: savedComment._id.toString(),
          content: String(savedComment.content || ''),
          author: {
            _id: context.user._id.toString(),
            username: String(profile?.username || ''),
            email: String(profile?.email || ''),
          },
          thread: {
            _id: threadId,
          },
          createdAt: savedComment.createdAt ? savedComment.createdAt.toISOString() : new Date().toISOString(),
          updatedAt: savedComment.updatedAt ? savedComment.updatedAt.toISOString() : new Date().toISOString(),
        };
      } catch (error) {
        console.error('Error creating comment:', error);
        throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
};

export default threadResolvers;