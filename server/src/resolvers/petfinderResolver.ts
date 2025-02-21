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
                console.error('PetfinderAPI not initialized in context');
                return []; // Return empty array instead of null
            }

            try {
                console.log('Getting pet types...');
                const response = await petfinderAPI.getTypes();
                console.log('Types response:', response);
                
                // Make sure we're always returning an array of strings
                const types = response.map((type: any) => type.toString());
                console.log('Processed types:', types);
                
                return types.length > 0 ? types : ['No types available'];
            } catch (error) {
                console.error('Error in getPetfinderTypes:', error);
                // Return a default value instead of throwing
                return ['Error loading types'];
            }
        },

        getPetfinderBreeds: async (_, { type }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                return ['API not initialized'];
            }

            try {
                const breeds = await petfinderAPI.getBreeds(type);
                return breeds.length > 0 ? breeds : ['No breeds available'];
            } catch (error) {
                console.error('Error fetching breeds:', error);
                return ['Error loading breeds'];
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
                throw new ApolloError('Failed to search pets', 'SEARCH_ERROR', {
                    originalError: error
                });
            }
        }
    }
};

export default petfinderResolvers;