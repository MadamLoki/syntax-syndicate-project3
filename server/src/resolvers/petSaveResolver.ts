// server/src/resolvers/petSaveResolver.ts
import { IResolvers } from '@graphql-tools/utils';
import Profile from '../models/Profile.js';
import { AuthenticationError } from '../utils/auth.js';

const petSaveResolver: IResolvers = {
    Mutation: {
        savePet: async (_parent: unknown, { petId }: { petId: string }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Add pet reference to user's savedPets array
                // Use addToSet to avoid duplicates
                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedPets: petId } },
                    { new: true }
                ).populate('savedPets');

                if (!updatedProfile) {
                    throw new Error('User not found');
                }

                return updatedProfile;
            } catch (error) {
                console.error('Error saving pet:', error);
                throw new Error('Failed to save pet');
            }
        },

        removeSavedPet: async (_parent: unknown, { petId }: { petId: string }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Remove pet reference from user's savedPets array
                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { savedPets: petId } },
                    { new: true }
                ).populate('savedPets');

                if (!updatedProfile) {
                    throw new Error('User not found');
                }

                return updatedProfile;
            } catch (error) {
                console.error('Error removing saved pet:', error);
                throw new Error('Failed to remove saved pet');
            }
        }
    }
};

export default petSaveResolver;