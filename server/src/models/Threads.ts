import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPet {
  name: string;
  species: string;
  breed?: string;
  age: number;
  description?: string;
  image?: string; // This will store the Cloudinary URL for the pet image
}

export interface IThread extends Document {
  title: string;
  content: string;
  threadType: 'ADOPTION' | 'SURRENDER';
  pet: IUserPet;  // Nested pet information
  author: mongoose.Types.ObjectId;  // Reference to the User model
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IUserPet>({
  name: { type: String, required: true },
  species: { type: String, required: true },
  breed: { type: String },
  age: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
});

const threadSchema = new Schema<IThread>(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    threadType: { 
      type: String, 
      required: true, 
      enum: ['ADOPTION', 'SURRENDER'] 
    },
    pet: { type: petSchema, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IThread>('Thread', threadSchema);