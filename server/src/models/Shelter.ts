import { Schema, model, Document } from 'mongoose';

// Define an interface for the Profile document
export interface Shelter extends Document {
    latitude: number;
    longitude: number;
    contactInfo: string;
}

// Define the schema for the Profile document
const shelterSchema = new Schema({
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },
    contactInfo: {
        type: String,
        required: true,
    },
}, {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});


const Shelter = model<Shelter>('Shelter', shelterSchema);

export default Shelter;