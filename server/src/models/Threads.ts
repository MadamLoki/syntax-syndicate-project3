import mongoose, { Schema, Document } from 'mongoose';
import { IUserPet } from './UserPet';
import { IProfile } from './Profile';


export interface IThread extends Document {
  title: string;
  content: string;
  threadType: 'ADOPTION' | 'SURRENDER';
  pet: IUserPet;  // Nested pet information
  author: IProfile;  // Reference to the Profile model
  createdAt: Date;
  updatedAt: Date;
}

const petSchema = new Schema<IUserPet>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    species: {
      type: String,
      required: true,
      enum: ['Dog', 'Cat', 'Bird', 'Fish', 'Small Animal', 'Reptile', 'Other']
    },
    breed: {
      type: String,
      trim: true
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Profile',
      required: true
    }
  },
  { timestamps: true }
);



const Thread = new Schema<IThread>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    threadType: {
      type: String,
      required: true,
      enum: ['ADOPTION', 'SURRENDER']
    },
    pet: {
      type: petSchema,
      required: true
    },
  });


export default mongoose.model<IThread>('Thread', Thread);