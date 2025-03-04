import {Schema, model, Document } from 'mongoose';

export interface IPet extends Document {
  externalId?: string;
  name: string;
  breed?: string;
  age?: number | string;
  images?: string[];
  status?: string;
  shelterId: string;
  type?: string;
  gender?: string;
  size?: string;
  description?: string;
  source?: string;
}

const petSchema = new Schema<IPet>(
  {
    externalId: { type: String },
    name: { type: String, required: true },
    breed: { type: String },
    age: { 
      type: Schema.Types.Mixed, // Allow both number or string (like "Adult")
      default: 'Unknown'
    },
    type: { type: String, default: 'Unknown' },
    gender: { type: String },
    size: { type: String },
    description: { type: String },
    images: [{ type: String }],
    status: { type: String, default: 'Available' },
    shelterId: { type: String, required: true },
    source: { type: String, default: 'user' }
  },
  { timestamps: true }
);

// Add index for faster lookup
petSchema.index({ externalId: 1 });

export default model<IPet>('Pet', petSchema);