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
        // console.log('Checking token status...');
        // If we have a valid token with at least 60 seconds left, return it
        if (this.token && Date.now() < this.tokenExpiration - 60000) {
           // console.log('Using existing token (expires in:', Math.round((this.tokenExpiration - Date.now()) / 1000), 'seconds)');
            return this.token;
        }

        // If a token refresh is already in progress, wait for it
        if (this.tokenRefreshPromise) {
            console.log('Token refresh already in progress, waiting...');
            return this.tokenRefreshPromise;
        }

        // Start a new token refresh
        console.log('Starting new token refresh...');
        this.tokenRefreshPromise = (async () => {
            try {
                // Validate API key and secret
                if (!this.apiKey || !this.apiSecret) {
                    console.error('Missing API key or secret');
                    throw new Error('Petfinder API credentials are missing or invalid');
                }

                console.log('Requesting new token from Petfinder API...');

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

                // Check for non-200 response
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error(`Authentication failed: ${response.status} ${response.statusText}`, errorText);
                    throw new Error(`Petfinder authentication failed: ${response.statusText}`);
                }

                const data = await response.json() as PetfinderAuthResponse;

                if (!data || !data.access_token) {
                    throw new Error('Invalid authentication response from Petfinder API');
                }

                if (data.token_type !== 'Bearer') {
                    console.warn('Unexpected token type received:', data.token_type);
                }

                this.token = data.access_token;
                // Set expiration to 60 seconds before actual expiration for safety
                this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000;

                console.log('Token refreshed successfully, expires in', data.expires_in, 'seconds');
                return this.token;
            } catch (error) {
                console.error('Token refresh error:', error);
                // Clear the token to force a complete refresh next time
                this.token = null;
                this.tokenExpiration = 0;
                throw error;
            } finally {
                this.tokenRefreshPromise = null;
            }
        })();

        return this.tokenRefreshPromise;
    }

    private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        try {
            const token = await this.getToken();

            // Clean parameters: remove nulls, undefined, and empty strings
            const cleanParams = Object.fromEntries(
                Object.entries(params)
                    .filter(([_, value]) => value != null && value !== '')
                    .map(([key, value]) => {
                        // Convert arrays or objects to JSON strings if needed
                        if (typeof value === 'object' && value !== null) {
                            return [key, JSON.stringify(value)];
                        }
                        return [key, value];
                    })
            );

            // Build URL with clean parameters
            const queryParams = new URLSearchParams(cleanParams).toString();
            const url = `${this.baseUrl}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;

            // console.log(`Making request to: ${url}`);

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            // Handle non-200 responses properly
            if (!response.ok) {
                // Try to get error details from response
                let errorDetails = '';
                try {
                    const errorData = await response.json();
                    errorDetails = JSON.stringify(errorData);
                } catch (e) {
                    // If parsing fails, use status text
                    errorDetails = response.statusText;
                }

                throw new Error(`Petfinder API request failed (${response.status}): ${errorDetails}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Petfinder API request error:', error);
            throw error;
        }
    }

    public async getTypes(): Promise<string[]> {
        try {
            //console.log('PetfinderAPI: Fetching pet types...');
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
        // Ensure all parameters are properly formatted
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

        // Ensure location is properly formatted for the API
        if (cleanParams.location && cleanParams.location.length === 5 && !isNaN(Number(cleanParams.location))) {
            // It's likely a zip code, make sure it's properly formatted
            cleanParams.location = cleanParams.location.trim();
        }

        // Remove undefined or empty values
        Object.keys(cleanParams).forEach(key =>
            (cleanParams[key] === undefined || cleanParams[key] === '') && delete cleanParams[key]
        );

        return this.makeRequest('animals', cleanParams);
    }

    public async getPetById(id: string) {
        if (!id) {
            throw new Error('Pet ID is required');
        }

        try {
            return this.makeRequest<any>(`animals/${id}`);
        } catch (error) {
            console.error(`Error fetching pet with ID ${id}:`, error);
            throw error;
        }
    }
}

// Export factory function for creating singleton instance
export const createPetfinderAPI = (apiKey: string, apiSecret: string): PetfinderAPI => {
    return PetfinderAPI.getInstance(apiKey, apiSecret);
};

export default PetfinderAPI;