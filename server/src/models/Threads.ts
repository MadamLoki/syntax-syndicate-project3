import mongoose, { Schema, model } from 'mongoose';

export interface Thread extends Document {
    title: string;
    content: string;  
    author: Schema.Types.ObjectId; // User ID or username of the author
    createdAt: Date;
    updatedAt: Date;
}

const threadSchema = new Schema<Thread>(
    {
        title: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        author: {
            type: Schema.Types.ObjectId, ref: 'User', required: true,},
        },
    {  timestamps: true }
);

export default mongoose.model<Thread>('Thread', threadSchema);
