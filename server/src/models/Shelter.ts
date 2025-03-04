import { Schema, model, Document } from 'mongoose';

// Define an interface for the Shelter document
export interface IShelter extends Document {
    name: string;
    latitude: number;
    longitude: number;
    email?: string;
    phone?: string;
    contactInfo: string;
    address?: {
        street?: string;
        city: string;
        state: string;
        postalCode?: string;
        country: string;
    };
}

// Define the schema for the Shelter document
const shelterSchema = new Schema<IShelter>(
    {
        name: {
            type: String,
            required: true
        },
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        },
        email: {
            type: String
        },
        phone: {
            type: String
        },
        contactInfo: {
            type: String,
            required: true
        },
        address: {
            street: String,
            city: { type: String, required: true },
            state: { type: String, required: true },
            postalCode: String,
            country: { type: String, required: true }
        }
    },
    {
        timestamps: true,
        toJSON: { getters: true },
        toObject: { getters: true }
    }
);

const Shelter = model<IShelter>('Shelter', shelterSchema);

export default Shelter;
