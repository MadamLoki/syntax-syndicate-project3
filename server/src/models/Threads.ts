import mongoose, { Schema, Document } from 'mongoose';

export interface Thread extends Document {
    title: string;
    content: string;
    threadType: 'ADOPTION' | 'SURRENDER';
    petId?: mongoose.Types.ObjectId; // Reference to a Pet (optional or required as needed)
    author: mongoose.Types.ObjectId;  // references the User model
    createdAt: Date;
    updatedAt: Date;
  }
  

  const threadSchema = new Schema<Thread>(
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      threadType: { 
        type: String, 
        required: true, 
        enum: ['ADOPTION', 'SURRENDER'] 
      },
      petId: { type: Schema.Types.ObjectId, ref: 'Pet' }, // Removed images, added petId
      author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    },
    { timestamps: true }
  );

  export default mongoose.model<Thread>('Thread', threadSchema);