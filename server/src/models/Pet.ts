import {Schema, model, Document } from 'mongoose';

export interface IPet extends Document {
  externalId?: string; // For Petfinder API IDs
  name: string;
  breed?: string;
  age?: number | string; // Allow both number and string for age
  images?: string[];
  status?: string;
  shelterId: string;
  type?: string; // Add type field
  gender?: string; // Add gender field
  size?: string; // Add size field
  description?: string; // Add description field
  source?: string; // Add source (e.g., "petfinder", "user")
}

const petSchema = new Schema<IPet>(
  {
    externalId: { type: String }, // External API ID
    name: { type: String, required: true },
    breed: { type: String },
    age: { type: Schema.Types.Mixed }, // Allow both string/number
    type: { type: String },
    gender: { type: String },
    size: { type: String },
    description: { type: String },
    images: [{ type: String }],
    status: { type: String, default: 'Available' },
    shelterId: { type: Schema.Types.String, required: true },
    source: { type: String, default: 'user' }
  },
  { timestamps: true }
);

export default model<IPet>('Pet', petSchema);