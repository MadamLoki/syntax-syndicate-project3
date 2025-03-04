import React from 'react';
import { Outlet } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';

import '../src/index.css';
import { AuthProvider } from './components/auth/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

const httpLink = createHttpLink({
    uri: '/graphql'
});

const retryLink = new RetryLink({
    delay: {
        initial: 300,
        max: 3000,
        jitter: true
    },
    attempts: {
        max: 5,
        retryIf: (error, _operation) => {
            return !!error;
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