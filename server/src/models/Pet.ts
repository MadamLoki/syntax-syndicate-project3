import {Schema, model, Document } from 'mongoose';

export interface IPet extends Document {
  name: string;
  breed?: string;
  age?: number;
  images?: string[];
  status?: string;
  shelterId: string;
}

const petSchema = new Schema<IPet>(
    {
        name: { type: String, required: true },
    breed: { type: String },
    age: { type: Number },
    images: [{ type: String }],
    status: { type: String, default: 'Available' },
    shelterId: { type: Schema.Types.String, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default model<IPet>('Pet', petSchema);