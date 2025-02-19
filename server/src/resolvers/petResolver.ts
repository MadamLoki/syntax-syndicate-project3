import { IResolvers } from '@graphql-tools/utils';
import Pet, { IPet } from '../models/Pet.js';

const petResolvers: IResolvers = {
    Query: {
        pets: async (_: any, { searchTerm, type, breed, age, status, limit = 12, offset = 0 }: any) => {
            try {
                let query: any = {};
                
                // Build search query
                if (searchTerm) {
                    query = {
                        $or: [
                            { name: { $regex: searchTerm, $options: 'i' } },
                            { breed: { $regex: searchTerm, $options: 'i' } }
                        ]
                    };
                }
                
                // Add filters
                if (type) query.type = type;
                if (breed) query.breed = breed;
                if (age) query.age = age;
                if (status) query.status = status;

                const pets = await Pet.find(query)
                    .limit(limit)
                    .skip(offset)
                    .sort({ createdAt: -1 });

                return pets;
            } catch (error) {
                console.error('Error fetching pets:', error);
                throw new Error('Failed to fetch pets');
            }
        },
        
        pet: async (_: any, { id }: { id: string }) => {
            try {
                const pet = await Pet.findById(id);
                if (!pet) throw new Error('Pet not found');
                return pet;
            } catch (error) {
                console.error('Error fetching pet:', error);
                throw new Error('Failed to fetch pet');
            }
        }
    },
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