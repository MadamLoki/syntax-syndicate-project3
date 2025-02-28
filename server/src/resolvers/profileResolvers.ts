// server/src/resolvers/profileResolvers.ts
import { IResolvers } from '@graphql-tools/utils';
import { Profile, UserPet } from '../models/index.js';
import { AuthenticationError } from '../utils/auth.js';
import { uploadImage, deleteImage } from '../config/cloudinary.js';

const profileResolvers: IResolvers = {
    Query: {
        // Existing Query resolvers...
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
                // Create new pet document with image URL (already uploaded from client)
                const newPet = new UserPet({
                    ...input,
                    owner: context.user._id
                });

                await newPet.save();

                // Add pet reference to user's profile
                await Profile.findByIdAndUpdate(
                    context.user._id,
                    { $push: { userPets: newPet._id } }
                );

                return newPet;
            } catch (error) {
                console.error('Error adding pet:', error);
                throw new Error('Failed to add pet');
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
                        // Extract the public ID from the URL
                        const urlParts = pet.image.split('/');
                        const publicIdWithExtension = urlParts[urlParts.length - 1];
                        const publicId = publicIdWithExtension.split('.')[0];
                        
                        // Delete from Cloudinary
                        await deleteImage(publicId);
                    } catch (cloudinaryError) {
                        console.error('Error deleting image from Cloudinary:', cloudinaryError);
                        // Continue with pet deletion even if image deletion fails
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
        }
    }
};

export default profileResolvers;