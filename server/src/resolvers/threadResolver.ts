
import { IResolvers } from '@graphql-tools/utils';
import Thread from '../models/Threads';
import Comment from '../models/comment';
import { uploadImage } from '../config/cloudinary';  // import your Cloudinary functions

const threadResolvers: IResolvers = {
  Query: {
    // Fetches all threads, populating the author field
    threads: async () => {
      return await Thread.find().populate('author');
    },
    // Fetches a single thread by ID and its associated comments
    thread: async (_: any, { id }: { id: string }) => {
      const thread = await Thread.findById(id).populate('author');
      if (!thread) throw new Error('Thread not found');
      const comments = await Comment.find({ thread: id }).populate('author');
      return { ...thread.toObject(), comments };
    },
  },
  Mutation: {
    // Creates a new thread, including nested pet information
    createThread: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) throw new Error('You must be logged in to create a thread');

      // If a pet image is provided and is a base64 string, upload it to Cloudinary.
      let petImageUrl = input.pet.image;
      if (input.pet.image && input.pet.image.startsWith('data:')) {
        const uploadResult = await uploadImage(input.pet.image, 'forum-pets');
        petImageUrl = uploadResult.url;
      }

      // Create the new thread document using the nested pet object (with the updated image URL)
      const newThread = new Thread({
        title: input.title,
        content: input.content,
        threadType: input.threadType,
        pet: {
          ...input.pet,
          image: petImageUrl,
        },
        author: context.user.id,
      });
      return await newThread.save();
    },
    // Creates a comment for a thread
    createComment: async (_: any, { input }: { input: any }, context: any) => {
      if (!context.user) throw new Error('You must be logged in to comment');
      const thread = await Thread.findById(input.threadId);
      if (!thread) throw new Error('Thread not found');
      const newComment = new Comment({
        thread: input.threadId,
        content: input.content,
        author: context.user.id,
        parentComment: input.parentCommentId || undefined,
      });
      return await newComment.save();
    },
  },
};

export default threadResolvers;
