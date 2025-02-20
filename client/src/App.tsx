import { Outlet } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import '../src/index.css';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

const httpLink = createHttpLink({
    uri: '/graphql'
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        for (let err of graphQLErrors) {
            switch (err.extensions?.code) {
                case 'UNAUTHENTICATED':
                    const { getToken, logout } = useAuth();
                    const token = getToken();
                    if (!token) {
                        // Token is invalid or expired, logout user
                        logout();
                        return;
                    }
                    // Retry the failed request
                    const oldHeaders = operation.getContext().headers;
                    operation.setContext({
                        headers: {
                            ...oldHeaders,
                            authorization: `Bearer ${token}`
                        },
                    });
                    return forward(operation);
            }
        }
    }
    if (networkError) {
        console.log(`[Network error]: ${networkError}`);
    }
});

// Auth middleware
const authLink = setContext((_, { headers }) => {
    const { getToken } = useAuth();
    const token = getToken();
    
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});

const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache()
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