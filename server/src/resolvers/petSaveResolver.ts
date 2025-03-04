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
                // Log input for debugging
                // console.log('Saving Petfinder pet with input:', JSON.stringify(input, null, 2));
                
                // Validate required fields
                if (!input.externalId || !input.name || !input.type) {
                    throw new Error('Missing required field(s): externalId, name, or type');
                }
                
                let petAge: number | string = input.age;
                if (typeof input.age === 'string' && !isNaN(Number(input.age))) {
                    petAge = Number(input.age);
                }

                const petData = {
                    externalId: input.externalId,
                    name: input.name,
                    type: input.type || 'Unknown',
                    breed: input.breed || 'Unknown',
                    age: petAge,
                    gender: input.gender,
                    size: input.size,
                    status: input.status || 'Available',
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
                        // Try a simplified version as fallback if validation failed
                        const simplifiedPet = {
                            externalId: input.externalId,
                            name: input.name,
                            type: input.type || 'Unknown',
                            shelterId: 'petfinder',
                        };
                        pet = await Pet.create(simplifiedPet);
                        console.log('Created simplified pet due to validation issues:', pet._id);
                    }
                } else {
                    console.log('Found existing pet:', pet._id);
                    try {
                        await Pet.findByIdAndUpdate(pet._id, {
                            $set: petData
                        });
                    } catch (updateErr) {
                        console.error('Error updating pet document:', updateErr);
                    }
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