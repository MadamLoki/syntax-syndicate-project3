import { Profile as ProfileModel } from '../models/index.js';
import { signToken, AuthenticationError } from '../utils/auth.js';

interface Profile {
    _id: string;
    name: string;
    email: string;
    password: string;
    username: string;
}

interface ProfileArgs {
    profileId: string;
}

interface AddProfileArgs {
    input: {
        name: string;
        email: string;
        password: string;
        username: string;
    }
}

interface Context {
    user?: Profile; // Optional user profile in context
}

const resolvers = {
    Query: {
        profiles: async (): Promise<Profile[]> => {
            // Retrieve all profiles
            return await ProfileModel.find();
        },

        profile: async (_parent: unknown, { profileId }: ProfileArgs): Promise<Profile | null> => {
            // Retrieve a profile by its ID
            return await ProfileModel.findOne({ _id: profileId });
        },

        // By adding context to our query, we can retrieve the logged in user without specifically searching for them
        me: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile | null> => {
            if (context.user) {
                // If user is authenticated, return their profile
                return await ProfileModel.findOne({ _id: context.user._id });
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
        },
    },

    Mutation: {
        addProfile: async (_parent: unknown, { input }: AddProfileArgs): Promise<{ token: string; profile: Profile }> => {
            // Create a new profile with provided name, email, and password
            const profileDoc = await ProfileModel.create({ name: input.name, email: input.email, password: input.password, username: input.username });
            const profile = profileDoc.toObject();
            // Sign a JWT token for the new profile
            const token = signToken(profile.username, profile.email, profile._id);

            return { token, profile };
        },

        login: async (_parent: unknown, { email, password }: { email: string; password: string }): Promise<{ token: string; profile: Profile }> => {
            // Find a profile by email
            const profile = await ProfileModel.findOne({ email });
            if (!profile) {
                // If profile with provided email doesn't exist, throw an authentication error
                throw AuthenticationError;
            }
            // Check if the provided password is correct
            const correctPw = await profile.isCorrectPassword(password);
            if (!correctPw) {
                // If password is incorrect, throw an authentication error
                throw new AuthenticationError('Not Authenticated');
            }
            // Sign a JWT token for the authenticated profile
            const token = signToken(profile.username, profile.email, profile._id);
            return { token, profile };
        },

        removeProfile: async (_parent: unknown, _args: unknown, context: Context): Promise<Profile | null> => {
            if (context.user) {
                // If user is authenticated, remove their profile
                return await ProfileModel.findOneAndDelete({ _id: context.user._id });
            }
            // If user attempts to execute this mutation and isn't logged in, throw an error
            throw new AuthenticationError('Could not find user');
        },
    },
};

export default resolvers;
