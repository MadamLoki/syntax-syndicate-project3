import { IResolvers } from '@graphql-tools/utils';
import { Profile, UserPet } from '../models/index.js';
import { AuthenticationError } from '../utils/auth.js';
import { deleteImage } from '../config/cloudinary.js';

const profileResolvers: IResolvers = {
    Query: {
        // Implement the profile-related queries from the schema
        profiles: async (): Promise<any[]> => {
            // Retrieve all profiles
            return await Profile.find();
        },

        profile: async (_parent: unknown, { profileId }: { profileId: string }): Promise<any | null> => {
            // Retrieve a profile by its ID
            return await Profile.findOne({ _id: profileId });
        },

        me: async (_parent: unknown, _args: unknown, context: any): Promise<any | null> => {
            if (context.user) {
                // If user is authenticated, return their profile with populated userPets
                return await Profile.findOne({ _id: context.user._id })
                    .populate('savedPets')
                    .populate('userPets');
            }
            // If not authenticated, throw an authentication error
            throw new AuthenticationError('Not Authenticated');
        },
    },

    Mutation: {
        updateProfile: async (_parent: unknown, { input }: { input: any }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Find and update profile
                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    {
                        $set: {
                            ...(input.username && { username: input.username }),
                            ...(input.email && { email: input.email })
                        }
                    },
                    { new: true, runValidators: true }
                );

                if (!updatedProfile) {
                    throw new Error('Profile not found');
                }

                return updatedProfile;
            } catch (error) {
                console.error('Error updating profile:', error);
                throw new Error('Failed to update profile');
            }
        },

        addUserPet: async (_parent: unknown, { input }: { input: any }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Make sure we have the user ID
                if (!context.user._id) {
                    throw new Error('User ID is missing from context');
                }

                // Create new pet document with owner information
                const newPet = new UserPet({
                    ...input,
                    owner: context.user._id // Explicitly set the owner field
                });

                console.log('Creating new pet with owner:', context.user._id);

                const savedPet = await newPet.save();

                // Add pet reference to user's profile
                await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $push: { userPets: savedPet._id } }
                );

                return savedPet;
            } catch (error) {
                console.error('Error adding pet:', error);
                throw new Error(`Failed to add pet: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },

        removeUserPet: async (_parent: unknown, { petId }: { petId: string }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Find the pet to ensure it belongs to the user
                const pet = await UserPet.findById(petId);

                if (!pet) {
                    throw new Error('Pet not found');
                }

                if (pet.owner.toString() !== context.user._id.toString()) {
                    throw new AuthenticationError('Not authorized to remove this pet');
                }

                // If the pet has an image, delete it from Cloudinary
                if (pet.image) {
                    try {
                        // Use the improved deleteImage function that handles URL parsing
                        const deleteResult = await deleteImage(pet.image);
                        console.log('Image deletion result:', deleteResult);
                    } catch (cloudinaryError) {
                        // Log but don't block the operation if image deletion fails
                        console.error('Error deleting image from Cloudinary:', cloudinaryError);
                    }
                }

                // Remove pet from database
                await UserPet.findByIdAndDelete(petId);

                // Remove pet reference from user's profile
                await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $pull: { userPets: petId } }
                );

                return true;
            } catch (error) {
                console.error('Error removing pet:', error);
                throw new Error('Failed to remove pet');
            }
        },
        updateProfileImage: async (_parent: unknown, { imageUrl }: { imageUrl: string }, context: any) => {
            // Check if user is authenticated
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            try {
                // Update the user's profile with the new image URL
                const updatedProfile = await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $set: { profileImageUrl: imageUrl } },
                    { new: true }
                );

                if (!updatedProfile) {
                    throw new Error('Profile not found');
                }

                return updatedProfile;
            } catch (error) {
                console.error('Error updating profile image:', error);
                throw new Error('Failed to update profile image');
            }
        },
    }
};

export default profileResolvers;