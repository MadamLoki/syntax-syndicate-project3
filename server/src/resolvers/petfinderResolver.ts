import { IResolvers } from '@graphql-tools/utils';
import PetfinderAPI from '../routes/api/petFinderApi.js';

const petfinderResolvers: IResolvers = {
    Query: {
        getPetfinderTypes: async () => {
            try {
                return await PetfinderAPI.getTypes();
            } catch (error) {
                console.error('Error fetching pet types:', error);
                throw error;
            }
        },

        getPetfinderBreeds: async (_: any, { type }: { type: string }) => {
            try {
                return await PetfinderAPI.getBreeds(type.toLowerCase());
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

                return await PetfinderAPI.searchPets(cleanInput);
            } catch (error) {
                console.error('Error searching pets:', error);
                throw error;
            }
        },
    },
};

export default petfinderResolvers;