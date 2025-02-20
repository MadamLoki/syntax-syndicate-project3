import { IResolvers } from '@graphql-tools/utils';
import Shelter from '../models/Shelter.js';

const shelterResolvers: IResolvers = {
    Query: {
        shelters: async (_: any, _args: any) => {
            try {                
                const shelters = await Shelter.find()
                return shelters;
            } catch (error) {
                console.error('Error fetching shelters:', error);
                throw new Error('Failed to fetch shelters');
            }
        },
        
    },
    Mutation: {
        createShelter: async (_: any, { input }: { input: any }, context: any) => {
            // Verify that the user is logged in and has shelter/rescue privileges.
            // if (!context.user || !context.user.isShelter) {
            //     throw new Error('Unauthorized');
            // }

            const shelter = new Shelter({
                ...input
            });

            return await shelter.save();
        },

    },
};
      
export default shelterResolvers;