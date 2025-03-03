// server/src/resolvers/petSaveResolver.ts
import { IResolvers } from '@graphql-tools/utils';
import Profile from '../models/Profile.js';
import Pet from '../models/Pet.js';
import { AuthenticationError } from '../utils/auth.js';

const petSaveResolver: IResolvers = {
    Mutation: {
        // Keep the existing savePet mutation
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

        // Add the new savePetfinderPet mutation
        savePetfinderPet: async (_parent: unknown, { input }: { input: any }, context: any) => {
            // Check authentication
            if (!context.user) {
                throw new AuthenticationError('You must be logged in to save pets');
            }

            try {
                console.log('Saving Petfinder pet:', input);
                
                // Check if pet with this external ID already exists
                let pet = await Pet.findOne({ externalId: input.externalId });
                
                if (!pet) {
                    // Create a new pet entry
                    pet = await Pet.create({
                        externalId: input.externalId,
                        name: input.name,
                        type: input.type || 'Unknown',
                        breed: input.breed || 'Unknown',
                        age: input.age || 'Unknown',
                        gender: input.gender,
                        size: input.size,
                        status: input.status || 'Available',
                        images: input.images || [],
                        description: input.description,
                        shelterId: input.shelterId || 'petfinder',
                        source: 'petfinder'
                    });
                    
                    console.log('Created new pet:', pet._id);
                } else {
                    console.log('Found existing pet:', pet._id);
                }

                // Add to user's saved pets if not already saved
                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedPets: pet._id } },
                    { new: true }
                ).populate('savedPets');

                if (!updatedProfile) {
                    throw new Error('User profile not found');
                }

                return updatedProfile;
            } catch (error) {
                console.error('Error in savePetfinderPet resolver:', error);
                if (error instanceof Error) {
                    throw new Error(`Failed to save pet: ${error.message}`);
                } else {
                    throw new Error('Failed to save pet');
                }
            }
        },

        // Keep the existing removeSavedPet mutation
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