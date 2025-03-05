import React from 'react';
import { Outlet } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { onError } from '@apollo/client/link/error';

import '../src/index.css';
import { AuthProvider } from './components/auth/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';


const httpLink = createHttpLink({
    uri: '/graphql'
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach(({ message, locations, path }) => {
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
            );
        });
    }
    if (networkError) {
        console.error(`[Network error]: ${networkError}`);
    }
});

const retryLink = new RetryLink({
    delay: {
        initial: 300,
        max: 3000,
        jitter: true
    },
    attempts: {
        max: 5,         // Try up to 5 times
        retryIf: (error, _operation) => {
            // Only retry on network errors or specific server errors
            if (error.networkError) {
                console.log('Retrying due to network error...');
                return true;
            }
            
            // Also retry on 503 Service Unavailable or 502 Bad Gateway
            if (error.statusCode === 503 || error.statusCode === 502) {
                console.log('Retrying due to server temporarily unavailable...');
                return true;
            }
            
            return false;
        }
    }
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('id_token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});

const client = new ApolloClient({
    link: retryLink.concat(authLink.concat(httpLink)),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
        query: {
            fetchPolicy: 'network-only',
            errorPolicy: 'all',
        },
    },
    connectToDevTools: true // Enable Apollo DevTools
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