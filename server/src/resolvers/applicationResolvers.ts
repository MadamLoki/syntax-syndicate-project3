import { IResolvers } from '@graphql-tools/utils';
import Application, { IApplication }  from '../models/application';
import Pet from '../models/Pet.js';

const applicationResolvers: IResolvers = {
    Mutation: { 
        createApplication: async (_: any, { input }: { input: any }, context: any) => {
            // Optional: check if user is authenticated; if not, you might allow anonymous submissions
            const { petId, message } = input;
      
            // Optional: cross-reference PetFinder API data here if needed
      
            // Ensure the pet exists
            const pet = await Pet.findById(petId);
            if (!pet) throw new Error('Pet not found');
      
            // If the adopter is authenticated, capture their ID
            const adopterId = context.user ? context.user.id : undefined;
      
            const application = new Application({

                petId,
              adopterId,
              message,
              status: 'Pending',
            });
      
            return await application.save();
          }, 
        },
    }; 

    export default applicationResolvers;