import { mergeResolvers } from '@graphql-tools/merge';
import petResolvers from './petResolver';
import applicationResolvers from './applicationResolvers';
import resolvers from './resolvers';

const mergedResolvers = mergeResolvers([resolvers, petResolvers, applicationResolvers]);

export default mergedResolvers;