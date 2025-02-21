import { mergeTypeDefs } from '@graphql-tools/merge';
import { print } from 'graphql';

// Import all your type definitions
import baseTypeDefs from './typeDefs';
import petfinderSchema from '../schemas/petfinderSchema';
import petFormSchema from '../schemas/PetformSchema';

const types = [
    baseTypeDefs,
    petfinderSchema,
    petFormSchema
];

// Merge all type definitions
const mergedTypeDefs = mergeTypeDefs(types);

// Export the merged schema
export default print(mergedTypeDefs);