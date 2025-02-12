import { IResolvers } from '@graphql-tools/utils';
import Pet, { IPet } from '../models/Pet.js';


const petResolvers: IResolvers = {
    Mutation: {
        createPet: async (_: any, { input }: { input: any }, context: any) => {
            // Verify that the user is logged in and has shelter/rescue privileges.
            if (!context.user || !context.user.isShelter) {
              throw new Error('Unauthorized');
            }

            const pet = new Pet({
                ...input,
                shelterId: context.user._id,
            });

            return await pet.save();
        },

        updatePet: async (_: any, { id, input }: { id: string; input: any }, context: any) => {
            const pet = await Pet.findById(id);
            if (!pet) throw new Error('Pet not found');
            // Ensure the pet belongs to the logged-in shelter
            if (pet.shelterId.toString() !== context.user.id) {
              throw new Error('Unauthorized');
            }
            Object.assign(pet, input);
            return await pet.save();
        },

        deletePet: async (_: any, { id }: { id: string }, context: any) => {
            const pet = await Pet.findById(id);
            if (!pet) throw new Error('Pet not found');
            if (pet.shelterId.toString() !== context.user.id) {
              throw new Error('Unauthorized');
            }
            await Pet.deleteOne({ _id: id });
            return true;
          },
        },
      };
      
      export default petResolvers;