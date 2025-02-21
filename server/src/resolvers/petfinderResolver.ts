import { IResolvers } from '@graphql-tools/utils';
import { ApolloError } from 'apollo-server-express';
import type PetfinderAPI from '../routes/api/petFinderApi';

interface Context {
    petfinderAPI: PetfinderAPI;
}

const petfinderResolvers: IResolvers = {
    Query: {
        getPetfinderTypes: async (_, __, { petfinderAPI }) => {
            if (!petfinderAPI) {
                // Return an empty array instead of throwing
                return [];
            }

            try {
                const response = await petfinderAPI.getTypes();
                // Ensure we always return an array
                if (!response || !response.types) {
                    return [];
                }
                return response.types;
            } catch (error) {
                console.error('Error getting types:', error);
                // Return empty array instead of throwing
                return [];
            }
        },

        // Keep other resolvers the same...
        getPetfinderBreeds: async (_, { type }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                return ['No API Connection'];
            }

            try {
                const breeds = await petfinderAPI.getBreeds(type);
                return breeds.length > 0 ? breeds : ['No breeds available'];
            } catch (error) {
                console.error('Error fetching breeds:', error);
                return ['Error fetching breeds'];
            }
        },

        searchPetfinderPets: async (_, { input }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                throw new ApolloError('PetfinderAPI not initialized');
            }

            try {
                return await petfinderAPI.searchPets(input);
            } catch (error) {
                console.error('Error searching pets:', error);
                throw new ApolloError('Failed to search pets');
            }
        }
    }
};

export default petfinderResolvers;