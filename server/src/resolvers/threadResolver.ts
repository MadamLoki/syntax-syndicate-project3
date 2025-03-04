
import { IResolvers } from '@graphql-tools/utils';
import Thread from '../models/Threads';
import Comment from '../models/comment';
import { uploadImage } from '../config/cloudinary';  // Cloudinary upload function

const threadResolvers: IResolvers = {
  Query: {
    // Retrieve all threads and populate the author field
    threads: async () => {
      return await Thread.find().populate('author');
    },
    // Retrieve a single thread by ID and its associated comments
    thread: async (_: any, { id }: { id: string }) => {
      const thread = await Thread.findById(id).populate('author');
      if (!thread) throw new Error('Thread not found');
      const comments = await Comment.find({ thread: id }).populate('author');
      return { ...thread.toObject(), comments };
    },
  },
  Mutation: {
    // Create a new thread with nested pet details
    createThread: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) throw new Error('You must be logged in to create a thread');

      // Check if pet image is provided and is a base64 string
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
      return await newThread.save();
    },
    // Create a comment on a thread
    createComment: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) throw new Error('You must be logged in to comment');
      const thread = await Thread.findById(input.threadId);
      if (!thread) throw new Error('Thread not found');
      const newComment = new Comment({
        thread: input.threadId,
        content: input.content,
        author: context.user._id,
        parentComment: input.parentCommentId || undefined,
      });
      return await newComment.save();
    },
  },
};

export default threadResolvers;
