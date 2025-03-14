import { mergeResolvers } from '@graphql-tools/merge';
import petResolvers from './petResolver';
import applicationResolvers from './applicationResolvers';
import resolvers from './resolvers';
import shelterResolvers from './shelterResolver';
import petfinderResolvers from './petfinderResolver';
import profileResolvers from './profileResolvers';
import threadResolvers from './threadResolver';
import imageUploadResolver from './imageResolver';
import petSaveResolver from './petSaveResolver';

const mergedResolvers = mergeResolvers([
    resolvers, 
    petResolvers, 
    applicationResolvers, 
    shelterResolvers, 
    petfinderResolvers,
    profileResolvers,
    threadResolvers,
    imageUploadResolver,
    petSaveResolver
]);

export default mergedResolvers;