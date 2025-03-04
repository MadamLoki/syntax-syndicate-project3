import mongoose, { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcrypt';

// Define an interface for the Profile document
export interface IProfile extends Document {
    username: string;
    email: string;
    password: string;
    profileImage?: string;
    savedPets: mongoose.Types.ObjectId[];
    userPets: mongoose.Types.ObjectId[]; 
    isCorrectPassword(password: string): Promise<boolean>;
}

// Define the schema for the Profile document
const profileSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: ''
    },
    savedPets: 
        [{
            type: Schema.Types.ObjectId,
            ref: 'Pet'
        }],
        userPets: [{ 
            type: Schema.Types.ObjectId,
            ref: 'UserPet'
        }]
    }, 
    {
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

// set up pre-save middleware to create password
profileSchema.pre('save', async function(this: mongoose.Document & IProfile, next: mongoose.CallbackWithoutResultAndOptionalError) {
    if (this.isNew || this.isModified('password')) {
        const saltRounds = 10;
        this.password = await bcrypt.hash(this.password, saltRounds);
    }
    next();
});

// compare the incoming password with the hashed password
profileSchema.methods.isCorrectPassword = async function(this: IProfile, password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
};

const Profile = model<IProfile>('Profile', profileSchema);

export default Profile;