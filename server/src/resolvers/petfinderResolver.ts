// server/src/resolvers/petfinderResolver.ts
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
                console.log('No petfinderAPI instance');
                return [];
            }
        
            try {
                const types = await petfinderAPI.getTypes();
                
                // Ensure we have an array of types
                if (!types || !Array.isArray(types)) {
                    console.log('Invalid response format');
                    return [];
                }
        
                // Transform and validate each type
                const validTypes = types.filter(type => typeof type === 'string' && type.length > 0);
                
                return validTypes;
            } catch (error) {
                console.error('Error getting types:', error);
                // Return empty array instead of throwing to prevent UI breaks
                return [];
            }
        },

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

        // Add a new query for fetching a pet by ID
        getPetfinderPetById: async (_, { id }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                throw new ApolloError('PetfinderAPI not initialized');
            }

            try {
                console.log(`Fetching Petfinder pet by ID: ${id}`);
                
                // Use the getPetById method we'll add to the API class
                const response = await petfinderAPI.getPetById(id);
                
                if (!response || !response.animal) {
                    throw new ApolloError('Pet not found');
                }
                
                return response.animal;
            } catch (error) {
                console.error(`Error fetching pet with ID ${id}:`, error);
                throw new ApolloError('Failed to fetch pet details', 'PETFINDER_API_ERROR', {
                    id
                });
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