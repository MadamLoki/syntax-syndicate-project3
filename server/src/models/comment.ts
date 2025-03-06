import mongoose, { Schema, Document } from 'mongoose';

export interface Comment extends Document {
    thread: mongoose.Types.ObjectId; // Reference to the thread
    content: string; // Content of the comment
    author: mongoose.Types.ObjectId; // Reference to the user who made the comment
    parentComment?: mongoose.Types.ObjectId; // Optional reference to the parent comment (for nested comments)
    createdAt: Date; // Timestamp of when the comment was created
    updatedAt: Date; // Timestamp of when the comment was last updated
}

const commentSchema = new Schema<Comment>(
    {
        thread: {
            type: Schema.Types.ObjectId,
            ref: 'Thread',
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId,ref: 'User', required: true },
          
          },
          { timestamps: true }
        );
        
        export default mongoose.model<Comment>('Comment', commentSchema);

