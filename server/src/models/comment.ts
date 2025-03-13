import mongoose, { Schema, Document } from 'mongoose';

export interface comment extends Document {
    thread: mongoose.Types.ObjectId; 
    content: string; 
    author: mongoose.Types.ObjectId; // Reference to the user who made the comment
    parentComment?: mongoose.Types.ObjectId; 
    createdAt: Date; // Timestamp of when the comment was created
    updatedAt: Date; 
}

const commentSchema = new Schema<comment>(
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
            type: Schema.Types.ObjectId,ref: 'Profile', 
            required: true },
          
          },
          { timestamps: true }
        );
        
        export default mongoose.model<Comment>('Comment', commentSchema);

