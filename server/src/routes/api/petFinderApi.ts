import { ApolloError } from 'apollo-server-errors';

interface PetfinderToken {
    token: string;
    expiresAt: number;
}

interface PetfinderAuthResponse {
    token_type: string;
    expires_in: number;
    access_token: string;
}

interface PetfinderSearchParams {
    type?: string;
    breed?: string;
    size?: string;
    gender?: string;
    age?: string;
    location?: string;
    distance?: number;
    name?: string;
    page?: number;
    limit?: number;
    [key: string]: any; // Allow for additional parameters
}

class PetfinderAPI {
    private static instance: PetfinderAPI;
    private token: string | null = null;
    private tokenExpiration: number = 0;
    private readonly baseUrl = 'https://api.petfinder.com/v2';
    private readonly apiKey: string;
    private readonly apiSecret: string;
    private tokenRefreshPromise: Promise<string> | null = null;

    private constructor(apiKey: string, apiSecret: string) {
        if (!apiKey || !apiSecret) {
            throw new Error('API key and secret are required');
        }
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }

    public static getInstance(apiKey?: string, apiSecret?: string): PetfinderAPI {
        if (!PetfinderAPI.instance) {
            if (!apiKey || !apiSecret) {
                throw new Error('API key and secret are required for initialization');
            }
            PetfinderAPI.instance = new PetfinderAPI(apiKey, apiSecret);
        }
        return PetfinderAPI.instance;
    }

    private async getToken(): Promise<string> {
        console.log('Getting token...');
        // If we have a valid token, return it
        if (this.token && Date.now() < this.tokenExpiration - 30000) { // 30-second buffer
            console.log('Using existing token');
            return this.token;
        }

        // If a token refresh is already in progress, wait for it
        if (this.tokenRefreshPromise) {
            return this.tokenRefreshPromise;
        }

        // Start a new token refresh
        this.tokenRefreshPromise = (async () => {
            try {
                console.log('Requesting new token...');
                console.log('API Key length:', this.apiKey.length);
                console.log('API Secret length:', this.apiSecret.length);
                
                const response = await fetch(`${this.baseUrl}/oauth2/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        'grant_type': 'client_credentials',
                        'client_id': this.apiKey,
                        'client_secret': this.apiSecret,
                    }),
                });

                if (!response.ok) {
                    throw new Error(`Authentication failed: ${response.statusText}`);
                }

                const data = await response.json() as PetfinderAuthResponse;
                
                if (data.token_type !== 'Bearer') {
                    throw new Error('Unexpected token type received');
                }

                this.token = data.access_token;
                // Set expiration to 60 seconds before actual expiration for safety
                this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000;
                
                return this.token;
            } catch (error) {
                console.error('Token refresh error:', error);
                throw new ApolloError(
                    'Failed to authenticate with Petfinder API',
                    'PETFINDER_AUTH_ERROR',
                    { originalError: error }
                );
            } finally {
                this.tokenRefreshPromise = null;
            }
        })();

        return this.tokenRefreshPromise;
    }

    private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        const maxRetries = 2;
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                const token = await this.getToken();
                
                const queryString = new URLSearchParams(
                    Object.entries(params)
                        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
                        .reduce((acc, [key, value]) => ({ ...acc, [key]: String(value) }), {})
                ).toString();

                const url = `${this.baseUrl}/${endpoint}${queryString ? `?${queryString}` : ''}`;

                const response = await fetch(url, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    
                    // If token is expired, invalidate it and retry
                    if (response.status === 401 && attempt < maxRetries) {
                        this.token = null;
                        this.tokenExpiration = 0;
                        continue;
                    }

                    throw new ApolloError(
                        'Petfinder API request failed',
                        'PETFINDER_API_ERROR',
                        errorData
                    );
                }

                return response.json();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (attempt === maxRetries) {
                    throw error instanceof ApolloError ? error : new ApolloError(
                        'Failed to fetch data from Petfinder API',
                        'PETFINDER_API_ERROR',
                        { originalError: lastError }
                    );
                }
            }
        }

        // This should never be reached due to the throw in the loop
        throw lastError || new Error('Unknown error occurred');
    }

    // Public methods for GraphQL resolvers
    public async getTypes(): Promise<string[]> {
        const response = await this.makeRequest<{ types: { name: string }[] }>('types');
        return response.types.map(type => type.name);
    }

    public async getBreeds(type: string): Promise<string[]> {
        if (!type) {
            throw new Error('Type parameter is required');
        }
        const response = await this.makeRequest<{ breeds: { name: string }[] }>(`types/${type.toLowerCase()}/breeds`);
        return response.breeds.map(breed => breed.name);
    }

    public async searchPets(params: PetfinderSearchParams) {
        return this.makeRequest('animals', {
            ...params,
            limit: params.limit || 100
        });
    }
}

// Export factory function for creating singleton instance
export const createPetfinderAPI = (apiKey: string, apiSecret: string): PetfinderAPI => {
    return PetfinderAPI.getInstance(apiKey, apiSecret);
};

export default PetfinderAPI;