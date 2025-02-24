import { mergeResolvers } from '@graphql-tools/merge';
import petResolvers from './petResolver';
import applicationResolvers from './applicationResolvers';
import resolvers from './resolvers';
import shelterResolvers from './shelterResolver';
import petfinderResolvers from './petfinderResolver';

const mergedResolvers = mergeResolvers([resolvers, petResolvers, applicationResolvers, shelterResolvers, petfinderResolvers]);

export default mergedResolvers;