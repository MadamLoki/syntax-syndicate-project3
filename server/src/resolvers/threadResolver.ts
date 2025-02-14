import { IResolvers } from '@graphql-tools/utils';
import  Thread  from '../models/Threads';
import Comment from '../models/comment';

const threadResolver: IResolvers = {
    Query: {
        threads: async (_, __, { Thread }) => {
            return await Thread.find().populate('author', 'username');
        },
        thread: async (_: any, { id }: { id: string }, { Thread }) => {
            // Retrieve a single thread by ID and populate comments and author.
            const thread = await Thread.findById(id).populate('author');
            if (!thread) throw new Error('Thread not found');

            const comments = await Comment.find({ thread: id }).populate('author');
            return { ...thread.toObject(), comments };
        },
    },
    Mutation: {
      createThread: async (_: any, { input }: { input: any }, context: any) => {
        // Ensure the user is authenticated via JWT.
        if (!context.user) throw new Error('You must be logged in to create a thread');
  
        const newThread = new Thread({
          title: input.title,
          content: input.content,
          author: context.user.id,
        });
        return await newThread.save();
      },
      createComment: async (_: any, { input }: { input: any }, context: any) => {
        // Ensure the user is authenticated.
        if (!context.user) throw new Error('You must be logged in to comment');
  
        // Verify the thread exists.
        const thread = await Thread.findById(input.threadId);
        if (!thread) throw new Error('Thread not found');
  
        const newComment = new Comment({
          thread: input.threadId,
          content: input.content,
          author: context.user.id,
          parentComment: input.parentCommentId ? input.parentCommentId : undefined,
        });
        return await newComment.save();
      },
    },
  };
  
  export default threadResolver;