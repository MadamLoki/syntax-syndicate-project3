import { mergeResolvers } from '@graphql-tools/merge';
import petResolvers from './petResolver';
import applicationResolvers from './applicationResolvers';
import resolvers from './resolvers';
import shelterResolvers from './shelterResolver';

const mergedResolvers = mergeResolvers([resolvers, petResolvers, applicationResolvers, shelterResolvers]);

export default mergedResolvers;