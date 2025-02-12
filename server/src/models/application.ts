import { Schema, model, Document } from 'mongoose';

export interface IApplication extends Document {
    petId: Schema.Types.ObjectId;
    adopterId?: Schema.Types.ObjectId;
    message: string;
    status: string;
    createdAt: Date;
}

const applicationSchema = new Schema<IApplication>(
    {
        petId: { type: Schema.Types.ObjectId, ref: 'Pet', required: true },
        adopterId: { type: Schema.Types.ObjectId, ref: 'User' },
        message: { type: String, required: true },
        status: { type: String, default: 'Pending' },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export default model<IApplication>('Application', applicationSchema);