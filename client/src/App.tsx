import { Outlet } from 'react-router-dom';
import { ApolloClient, InMemoryCache, ApolloProvider, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import '../src/index.css';
import { AuthProvider } from './components/auth/AuthContext';
import NavBar from './components/layout/NavBar';
import Footer from './components/layout/Footer';

const httpLink = createHttpLink({
    uri: '/graphql'
});

// Auth middleware
const authLink = setContext((_, { headers }) => {
    // get the authentication token from local storage if it exists
    const token = localStorage.getItem('id_token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : ''
        }
    };
});

const client = new ApolloClient({
    link: authLink.concat(httpLink),
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