// server/src/models/UserPet.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IUserPet extends Document {
    name: string;
    species: string;
    breed?: string;
    age: number;
    description?: string;
    image?: string;
    owner: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const userPetSchema = new Schema<IUserPet>(
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

const UserPet = mongoose.model<IUserPet>('UserPet', userPetSchema);

export default UserPet;