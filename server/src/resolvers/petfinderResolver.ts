import { IResolvers } from '@graphql-tools/utils';
import { ApolloError } from 'apollo-server-express';
import type PetfinderAPI from '../routes/api/petFinderApi';

interface Context {
    petfinderAPI: PetfinderAPI;
}

const petfinderResolvers: IResolvers = {
    Query: {
        getPetfinderTypes: async (_, __, context) => {
            console.log('Context in resolver:', context);
            console.log('PetfinderAPI instance:', context.petfinderAPI);
            
            if (!context.petfinderAPI) {
                throw new Error('Petfinder API not initialized in context');
            }

            try {
                const types = await context.petfinderAPI.getTypes();
                console.log('Retrieved types:', types);
                return types;
            } catch (error) {
                console.error('Error in getPetfinderTypes:', error);
                throw new ApolloError(
                    'Failed to fetch pet types',
                    'PETFINDER_API_ERROR',
                    { originalError: error }
                );
            }
        },

        getPetfinderBreeds: async (_, { type }: { type: string }, { petfinderAPI }: Context) => {
            try {
                return await petfinderAPI.getBreeds(type.toLowerCase());
            } catch (error) {
                console.error('Error fetching breeds:', error);
                if (error instanceof ApolloError) {
                    throw error;
                }
                throw new ApolloError(
                    'Failed to fetch breeds',
                    'PETFINDER_API_ERROR',
                    { originalError: error }
                );
            }
        },

        searchPetfinderPets: async (_, { input }: { input: any }, { petfinderAPI }: Context) => {
            try {
                // The cleanup is now handled inside the PetfinderAPI class
                return await petfinderAPI.searchPets(input);
            } catch (error) {
                console.error('Error searching pets:', error);
                if (error instanceof ApolloError) {
                    throw error;
                }
                throw new ApolloError(
                    'Failed to search pets',
                    'PETFINDER_API_ERROR',
                    { originalError: error }
                );
            }
        },
    },
};

export default petfinderResolvers;