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
        try {
            const token = await this.getToken();
            //console.log(`Making request to endpoint: ${endpoint}`);
            
            const queryParams = Object.entries(params)
                .filter(([_, value]) => value != null && value !== '')
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
    
            const url = `${this.baseUrl}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
            //console.log('Request URL:', url);
    
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                throw new Error(`API request failed: ${response.statusText}`);
            }
    
            const data = await response.json();
            //console.log('API Response Data:', JSON.stringify(data, nSull, 2));
            return data;
        } catch (error) {
            console.error('makeRequest error:', error);
            throw error;
        }
    }

    public async getTypes(): Promise<string[]> {
        try {
            console.log('PetfinderAPI: Fetching pet types...');
            const response = await this.makeRequest<{ types: { name: string }[] }>('types');
            //console.log('Raw API response:', response); // Debug log
    
            if (!response || !response.types) {
                console.error('PetfinderAPI: Invalid response structure');
                return [];
            }
    
            // Ensure we're properly extracting the type names
            const types = response.types.map(type => type.name);
            //console.log('Extracted types:', types); // Debug log
    
            return types;
        } catch (error) {
            console.error('PetfinderAPI: Error in getTypes:', error);
            return [];
        }
    }

    public async getBreeds(type: string): Promise<string[]> {
        if (!type) {
            throw new Error('Type parameter is required');
        }
        const response = await this.makeRequest<{ breeds: { name: string }[] }>(`types/${type.toLowerCase()}/breeds`);
           // Ensure the response has the expected structure
        return response.breeds.map((breed: { name: string }) => breed.name);
    }

    public async searchPets(params: PetfinderSearchParams) {
        // Clean up parameters
        const cleanParams: { [key: string]: any } = {
            type: params.type?.toLowerCase(),
            breed: params.breed,
            size: params.size?.toLowerCase(),
            gender: params.gender?.toLowerCase(),
            age: params.age?.toLowerCase(),
            location: params.location,
            distance: params.distance,
            limit: params.limit || 100,
            name: params.name
        };
    
        // Remove undefined or empty values
        Object.keys(cleanParams).forEach(key => 
            (cleanParams[key] === undefined || cleanParams[key] === '') && delete cleanParams[key]
        );
    
        return this.makeRequest('animals', cleanParams);
    }
}

// Export factory function for creating singleton instance
export const createPetfinderAPI = (apiKey: string, apiSecret: string): PetfinderAPI => {
    return PetfinderAPI.getInstance(apiKey, apiSecret);
};

export default PetfinderAPI;