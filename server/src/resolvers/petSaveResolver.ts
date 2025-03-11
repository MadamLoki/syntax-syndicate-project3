import { IResolvers } from '@graphql-tools/utils';
import Profile from '../models/Profile.js';
import Pet from '../models/Pet.js';
import { AuthenticationError } from '../utils/auth.js';

const petSaveResolver: IResolvers = {
    Mutation: {
        savePet: async (_parent: unknown, { petId }: { petId: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
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

        savePetfinderPet: async (_parent: unknown, { input }: { input: any }, context: any) => {
            // Check authentication
            if (!context.user) {
                throw new AuthenticationError('You must be logged in to save pets');
            }

            try {
                // Validate required fields
                if (!input.externalId || !input.name || !input.type) {
                    throw new Error('Missing required field(s): externalId, name, or type');
                }

                // Normalize status to ensure it's one of the allowed values
                let normalizedStatus = 'Available';
                if (input.status) {
                    const status = input.status.toString().toLowerCase();
                    if (['available', 'pending', 'adopted'].includes(status)) {
                        // Convert first letter to uppercase for consistent formatting
                        normalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
                    }
                }

                // Create a pet object with proper data typing and validation
                const petData = {
                    externalId: input.externalId,
                    name: input.name.substring(0, 100), // Ensure name is within length limits
                    type: input.type || 'Unknown',
                    breed: input.breed || null,
                    age: input.age || 'Unknown',
                    gender: input.gender || null,
                    size: input.size || null,
                    status: normalizedStatus,
                    images: Array.isArray(input.images) ? input.images : [],
                    description: input.description || '',
                    shelterId: input.shelterId || 'petfinder',
                    source: 'petfinder'
                };

                // Check if pet with this external ID already exists
                let pet = await Pet.findOne({ externalId: input.externalId });

                if (!pet) {
                    // Create a new pet entry
                    try {
                        pet = await Pet.create(petData);
                        console.log('Created new pet:', pet._id);
                    } catch (err) {
                        console.error('Error creating pet document:', err);
                        throw new Error(`Failed to create pet: ${err instanceof Error ? err.message : 'Unknown error'}`);
                    }
                } else {
                    console.log('Found existing pet:', pet._id);
                    try {
                        pet = await Pet.findByIdAndUpdate(
                            pet._id,
                            { $set: petData },
                            { new: true }
                        );
                    } catch (updateErr) {
                        console.error('Error updating pet document:', updateErr);
                        throw new Error(`Failed to update pet: ${updateErr instanceof Error ? updateErr.message : 'Unknown error'}`);
                    }
                }

                // Add to user's saved pets if not already saved
                if (!pet) {
                    throw new Error('Pet not found');
                }

                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $addToSet: { savedPets: pet._id } },
                    { new: true }
                ).populate({
                    path: 'savedPets',
                    select: '_id name type breed age gender size status description images shelterId source'
                });

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