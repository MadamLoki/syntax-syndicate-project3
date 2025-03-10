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
                throw new ApolloError('Petfinder API not initialized', 'PETFINDER_API_ERROR');
            }
        
            try {
                const types = await petfinderAPI.getTypes();
                
                // Validate response format
                if (!types || !Array.isArray(types)) {
                    console.error('Invalid response from Petfinder API:', types);
                    throw new ApolloError('Invalid response from Petfinder API', 'PETFINDER_DATA_ERROR');
                }
        
                // Transform and validate each type
                const validTypes = types.filter(type => typeof type === 'string' && type.length > 0);
                
                if (validTypes.length === 0 && types.length > 0) {
                    console.error('Received types but none were valid:', types);
                    throw new ApolloError('Invalid pet types received from API', 'PETFINDER_DATA_FORMAT_ERROR');
                }
                
                return validTypes;
            } catch (error) {
                console.error('Error getting pet types from Petfinder:', error);
                
                // Differentiate between different error types for better client-side handling
                if (error instanceof ApolloError) {
                    throw error; // Re-throw Apollo errors we've already created
                }
                
                let errorCode = 'PETFINDER_API_ERROR';
                let message = 'Failed to fetch pet types from Petfinder';
                
                // Enhance the error with more specific information if available
                if (error instanceof Error) {
                    message = `${message}: ${error.message}`;
                    
                    if (error.message.includes('authentication') || error.message.includes('token')) {
                        errorCode = 'PETFINDER_AUTH_ERROR';
                    } else if (error.message.includes('network') || error.message.includes('connect')) {
                        errorCode = 'PETFINDER_NETWORK_ERROR';
                    }
                }
                
                throw new ApolloError(message, errorCode, {
                    originalError: error
                });
            }
        },

        getPetfinderBreeds: async (_, { type }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                throw new ApolloError('Petfinder API not initialized', 'PETFINDER_API_ERROR');
            }

            if (!type) {
                throw new ApolloError('Type parameter is required', 'INVALID_PARAMETERS');
            }

            try {
                const breeds = await petfinderAPI.getBreeds(type);
                
                // Validate response
                if (!breeds || !Array.isArray(breeds)) {
                    console.error('Invalid breeds response:', breeds);
                    throw new ApolloError('Invalid response from Petfinder API', 'PETFINDER_DATA_ERROR');
                }
                
                // Return actual array, never fallback to placeholder values
                return breeds;
            } catch (error) {
                console.error('Error fetching breeds:', error);
                
                if (error instanceof ApolloError) {
                    throw error;
                }
                
                let errorCode = 'PETFINDER_API_ERROR';
                let message = `Failed to fetch breeds for type "${type}"`;
                
                if (error instanceof Error) {
                    message = `${message}: ${error.message}`;
                    
                    if (error.message.includes('authentication') || error.message.includes('token')) {
                        errorCode = 'PETFINDER_AUTH_ERROR';
                    } else if (error.message.includes('network') || error.message.includes('connect')) {
                        errorCode = 'PETFINDER_NETWORK_ERROR';
                    }
                }
                
                throw new ApolloError(message, errorCode, {
                    originalError: error,
                    petType: type
                });
            }
        },

        searchPetfinderPets: async (_, { input }, { petfinderAPI }) => {
            if (!petfinderAPI) {
                throw new ApolloError('Petfinder API not initialized', 'PETFINDER_API_ERROR');
            }
        
            try {
                // Convert GraphQL input to Petfinder API parameters
                const searchParams = {
                    ...input,
                    // Add any parameter transformations here if needed
                };
        
                const result = await petfinderAPI.searchPets(searchParams);
                
                // Validate the response structure
                if (!result || typeof result !== 'object') {
                    throw new ApolloError('Invalid response from Petfinder API', 'PETFINDER_DATA_ERROR');
                }
                
                // Transform and normalize the response to match our GraphQL schema
                // This is critical to handle field discrepancies
                if (result.animals && Array.isArray(result.animals)) {
                    // Make sure each animal has the expected fields
                    interface Animal {
                        id: string;
                        type: string;
                        species: string;
                        breeds: {
                            primary: string;
                            secondary: string | null;
                            mixed: boolean;
                            unknown: boolean;
                        };
                        colors: {
                            primary: string | null;
                            secondary: string | null;
                            tertiary: string | null;
                        };
                        age: string;
                        gender: string;
                        size: string;
                        coat: string | null;
                        name: string;
                        description: string;
                        photos: Array<{
                            small: string;
                            medium: string;
                            large: string;
                            full: string;
                        }>;
                        videos: Array<{
                            embed: string;
                        }>;
                        status: string;
                        attributes: {
                            spayed_neutered: boolean;
                            house_trained: boolean;
                            declawed: boolean | null;
                            special_needs: boolean;
                            shots_current: boolean;
                        };
                        environment: {
                            children: boolean | null;
                            dogs: boolean | null;
                            cats: boolean | null;
                        };
                        tags: string[];
                        contact: {
                            email: string;
                            phone: string;
                            address: {
                                address1: string | null;
                                address2: string | null;
                                city: string;
                                state: string;
                                postcode: string;
                                country: string;
                            };
                        };
                        organization_id: string | null;
                        published_at: string | null;
                        distance: number | null;
                    }

                    result.animals = result.animals.map((animal: Animal) => ({
                        ...animal,
                        // Provide defaults for potentially missing fields
                        colors: animal.colors || { primary: null, secondary: null, tertiary: null },
                        environment: animal.environment || { children: null, dogs: null, cats: null },
                        description: animal.description || "",
                        organization_id: animal.organization_id || null,
                        published_at: animal.published_at || null,
                        distance: typeof animal.distance === 'number' ? animal.distance : null
                    }));
                } else {
                    result.animals = [];
                }
                
                // Ensure pagination object is present
                if (!result.pagination) {
                    result.pagination = {
                        count_per_page: result.animals?.length || 0,
                        total_count: result.animals?.length || 0,
                        current_page: 1,
                        total_pages: 1
                    };
                }
                
                return result;
            } catch (error) {
                console.error('Error searching pets:', error);
                
                // Handle specific error types
                if (error instanceof ApolloError) {
                    throw error;
                }
                
                throw new ApolloError(
                    `Failed to search pets: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    'PETFINDER_SEARCH_ERROR',
                    { searchParams: input }
                );
            }
        }
    }
}

export default petfinderResolvers;