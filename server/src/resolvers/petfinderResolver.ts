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
                // console.log('PetFinder API Response:', types);
        
                // Ensure we have an array of types
                if (!types || !Array.isArray(types)) {
                    console.log('Invalid response format');
                    return [];
                }
        
                // Transform and validate each type
                const validTypes = types.filter(type => typeof type === 'string' && type.length > 0);
                //console.log('Validated types:', validTypes);
                
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