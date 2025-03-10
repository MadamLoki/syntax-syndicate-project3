// Update server/src/resolvers/petfinderResolver.ts

import { IResolvers } from '@graphql-tools/utils';
import { ApolloError } from 'apollo-server-express';

const petfinderResolvers: IResolvers = {
    Query: {
        getPetfinderTypes: async (_, __, { petfinderAPI }) => {
            if (!petfinderAPI) {
                console.error('No petfinderAPI instance available in context');
                throw new ApolloError('Pet search service unavailable', 'SERVICE_UNAVAILABLE');
            }
        
            try {
                console.log('Fetching pet types from Petfinder API...');
                const types = await petfinderAPI.getTypes();
                console.log('Successfully fetched types:', Array.isArray(types) ? types.length : 'Not an array');
        
                // Ensure we have an array of types
                if (!types || !Array.isArray(types)) {
                    console.error('Invalid response format from Petfinder API:', types);
                    return [];
                }
        
                // Transform and validate each type
                return types.filter(type => typeof type === 'string' && type.length > 0);
            } catch (error) {
                console.error('Error getting types from Petfinder API:', error);
                // Return empty array instead of throwing to prevent UI breaks
                return [];
            }
        },

        getPetfinderBreeds: async (_, { type }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                console.error('No petfinderAPI instance available in context');
                throw new ApolloError('Pet search service unavailable', 'SERVICE_UNAVAILABLE');
            }

            if (!type) {
                console.warn('No pet type provided for breed lookup');
                return ['Type required'];
            }

            try {
                console.log(`Fetching breeds for type: ${type}`);
                const breeds = await petfinderAPI.getBreeds(type);
                
                if (!breeds || !Array.isArray(breeds)) {
                    console.error('Invalid breeds response:', breeds);
                    return ['No breeds available'];
                }
                
                return breeds.length > 0 ? breeds : ['No breeds available'];
            } catch (error) {
                console.error('Error fetching breeds:', error);
                return ['Error fetching breeds'];
            }
        },

        searchPetfinderPets: async (_, { input }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                console.error('No petfinderAPI instance available in context');
                throw new ApolloError('Pet search service unavailable', 'SERVICE_UNAVAILABLE');
            }

            try {
                console.log('Searching pets with parameters:', JSON.stringify(input));
                
                // Fix common issues with input parameters
                const sanitizedInput = { ...input };
                
                // Ensure type is lowercase (Petfinder API requirement)
                if (sanitizedInput.type) {
                    sanitizedInput.type = sanitizedInput.type.toLowerCase();
                }
                
                // Convert distance to number if it's a string
                if (sanitizedInput.distance && typeof sanitizedInput.distance === 'string') {
                    sanitizedInput.distance = parseInt(sanitizedInput.distance, 10);
                }
                
                // Ensure limit is reasonable
                if (!sanitizedInput.limit || sanitizedInput.limit > 100) {
                    sanitizedInput.limit = 20;
                }
                
                // Default to page 1 if not specified
                if (!sanitizedInput.page) {
                    sanitizedInput.page = 1;
                }

                const result = await petfinderAPI.searchPets(sanitizedInput);
                console.log(`Search returned ${result?.animals?.length || 0} animals`);
                return result;
            } catch (error) {
                console.error('Error searching pets:', error);
                
                // Provide more specific error messages based on the error
                if ((error as { message?: string }).message?.includes('401')) {
                    throw new ApolloError('Authentication failed with pet search service', 'AUTH_FAILED');
                }
                
                if ((error as { message?: string }).message?.includes('429')) {
                    throw new ApolloError('Rate limit exceeded for pet searches', 'RATE_LIMIT');
                }
                
                throw new ApolloError(
                    'Failed to search pets: ' + ((error as Error).message || 'Unknown error'),
                    'SEARCH_FAILED',
                    { originalError: error }
                );
            }
        }
    }
};

export default petfinderResolvers;