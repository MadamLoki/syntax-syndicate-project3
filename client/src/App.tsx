import React from 'react';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';
import { Outlet } from 'react-router-dom';
import { AuthProvider } from './components/auth/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

// More detailed error logging
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path, extensions }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${extensions?.code}`
            );
            
            // Log the operation that caused the error
            console.log(`Operation ${operation.operationName} variables:`, operation.variables);
        });
    }
    if (networkError) {
        console.error(`[Network error for ${operation.operationName}]:`, networkError);
    }
});

// Improved retry logic for specific error types
const retryLink = new RetryLink({
    delay: {
        initial: 500,
        max: 5000,
        jitter: true
    },
    attempts: {
        max: 3,
        retryIf: (error, operation) => {
            // Check for specific error codes we want to retry
            if (error.graphQLErrors) {
                // Retry auth errors which might be fixed with a new token
                const hasAuthError = error.graphQLErrors!.some(
                    (err: { extensions?: { code?: string } }) => err.extensions?.code === 'PETFINDER_AUTH_ERROR'
                );
                if (hasAuthError) {
                    console.log('Retrying due to auth error...');
                    return true;
                }
                
                // Retry network-related errors
                const hasNetworkError: boolean = error.graphQLErrors!.some(
                    (err: { extensions?: { code?: string } }) => err.extensions?.code === 'PETFINDER_NETWORK_ERROR'
                );
                if (hasNetworkError) {
                    console.log('Retrying due to network error...');
                    return true;
                }
            }
            
            // Always retry on network errors
            if (error.networkError) {
                console.log('Retrying due to network error...');
                return true;
            }
            
            // Don't retry other types of errors
            return false;
        }
    }
});

// Token management improvements
const authLink = setContext((operation, { headers }) => {
    const token = localStorage.getItem('id_token');
    
    // Log operations that require authentication
    if (token) {
        //console.log(`Adding auth token to operation: ${operation.operationName}`);
    }
    
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});

// Build the Apollo Client with our enhanced links
const client = new ApolloClient({
    // Properly order the links for optimal processing
    link: from([
        errorLink,
        retryLink,
        authLink,
        createHttpLink({ uri: '/graphql' })
    ]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Ensure searches with the same parameters share cache results
                    searchPetfinderPets: {
                        keyArgs: ['input.type', 'input.breed', 'input.age', 'input.gender', 'input.size', 'input.location'],
                        // Merge function for pagination
                        merge(existing, incoming, { args }) {
                            // If it's a new search (page 1), replace everything
                            if (!args?.input.page || args.input.page <= 1) {
                                return incoming;
                            }
                            
                            // Otherwise merge results for pagination
                            if (!existing) return incoming;
                            
                            const merged = {
                                ...incoming,
                                animals: [
                                    ...existing.animals,
                                    ...incoming.animals
                                ]
                            };
                            
                            return merged;
                        }
                    }
                }
            }
        }
    }),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'cache-first',
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        mutate: {
            errorPolicy: 'all'
        }
    },
    connectToDevTools: true
});

const AppContent = () => {
    return (
        <div>
            <NavBar />
            <Outlet />
            <Footer />
        </div>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <ApolloProvider client={client}>
                <AppContent />
            </ApolloProvider>
        </AuthProvider>
    );
}