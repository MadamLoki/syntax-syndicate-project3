import { IResolvers } from '@graphql-tools/utils';
import petfinderAPIInstance from '../routes/api/petFinderApi';
import { ApolloError } from 'apollo-server-express';

const petfinderResolvers: IResolvers = {
    Query: {
        getPetfinderTypes: async (_, __, context) => {
            try {
                // Add logging to debug the request
                console.log('Fetching pet types...');
                const types = await context.petfinderAPI.getTypes();
                console.log('Pet types fetched:', types);
                return types;
            } catch (error) {
                console.error('Error in getPetfinderTypes:', error);
                // Add more detailed error information
                if (error instanceof ApolloError) {
                    throw error;
                }
                throw new ApolloError(
                    'Failed to fetch pet types',
                    'PETFINDER_API_ERROR',
                    { originalError: error }
                );
            }
        },

        getPetfinderBreeds: async (_: any, { type }: { type: string }) => {
            try {
                return await petfinderAPIInstance.getBreeds(type.toLowerCase());
            } catch (error) {
                console.error('Error fetching breeds:', error);
                throw error;
            }
        },

        searchPetfinderPets: async (_: any, { input }: { input: any }) => {
            try {
                // Clean up input parameters
                const cleanInput = Object.entries(input || {}).reduce((acc: any, [key, value]) => {
                    if (value !== null && value !== undefined && value !== '') {
                        acc[key] = value;
                    }
                    return acc;
                }, {});

                return await petfinderAPIInstance.searchPets(cleanInput);
            } catch (error) {
                console.error('Error searching pets:', error);
                throw error;
            }
        },
    },
};

export default petfinderResolvers;