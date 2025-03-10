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
                // Form data for token request
                const formData = new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'client_id': this.apiKey,
                    'client_secret': this.apiSecret,
                });
                
                const response = await fetch(`${this.baseUrl}/oauth2/token`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData,
                });

                if (!response.ok) {
                    const errorBody = await response.text();
                    throw new Error(`Authentication failed (${response.status}): ${response.statusText} - ${errorBody}`);
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
                this.token = null;
                this.tokenExpiration = 0;
                
                throw new ApolloError(
                    'Failed to authenticate with Petfinder API: ' + (error instanceof Error ? error.message : 'Unknown error'),
                    'PETFINDER_AUTH_ERROR'
                );
            } finally {
                this.tokenRefreshPromise = null;
            }
        })();

        return this.tokenRefreshPromise;
    }

    public async getAuthToken(): Promise<string> {
        return this.getToken();
    }

    private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        try {
            const token = await this.getToken();
            console.log(`Making request to endpoint: ${endpoint}`);
            
            // Build query params, filtering out null/undefined/empty values
            const queryParams = Object.entries(params)
                .filter(([_, value]) => value != null && value !== '')
                .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
                .join('&');
    
            const url = `${this.baseUrl}/${endpoint}${queryParams ? `?${queryParams}` : ''}`;
            console.log('Request URL:', url);
    
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
    
            // If response is not OK, handle error
            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                
                try {
                    // Try to parse error as JSON
                    errorData = JSON.parse(errorText);
                } catch (e) {
                    // If not JSON, use text as error
                    errorData = { message: errorText };
                }
                
                console.error('API Error Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    errorData
                });
                
                // Handle specific error cases
                if (response.status === 401) {
                    // Clear token and retry once
                    this.token = null;
                    this.tokenExpiration = 0;
                    
                    // If first attempt, try again with new token
                    if (!params._retry) {
                        console.log('Auth error - retrying with new token');
                        return this.makeRequest(endpoint, { ...params, _retry: true });
                    }
                    
                    throw new Error('Authentication failed after token refresh');
                }
                
                throw new Error(`API request failed: ${response.status} ${response.statusText}. ${errorData.message || 'Unknown error'}`);
            }
    
            // Parse and return response data
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('makeRequest error:', error);
            throw error;
        }
    }

    public async getTypes(): Promise<string[]> {
        try {
            const response = await this.makeRequest<{ types: { name: string }[] }>('types');
            
            if (!response || !response.types) {
                console.error('Invalid response from types endpoint:', response);
                return [];
            }
            
            // Extract type names
            return response.types.map(type => type.name);
        } catch (error) {
            console.error('Error getting types:', error);
            // Return empty array for non-critical errors
            return [];
        }
    }

    public async getBreeds(type: string): Promise<string[]> {
        if (!type) {
            throw new Error('Type parameter is required');
        }
        
        try {
            const response = await this.makeRequest<{ breeds: { name: string }[] }>(`types/${type.toLowerCase()}/breeds`);
            
            if (!response || !response.breeds || !Array.isArray(response.breeds)) {
                console.error('Invalid breeds response:', response);
                return [];
            }
            
            return response.breeds.map((breed: { name: string }) => breed.name);
        } catch (error) {
            console.error(`Error fetching breeds for ${type}:`, error);
            return [];
        }
    }

    public async getPetById(id: string) {
        if (!id) {
            throw new Error('Pet ID is required');
        }
        
        try {
            console.log(`Making request to get pet with ID: ${id}`);
            return this.makeRequest(`animals/${id}`);
        } catch (error) {
            console.error(`Error fetching pet with ID ${id}:`, error);
            throw error;
        }
    }

    public async searchPets(params: PetfinderSearchParams) {
        // Sanitize input parameters
        const sanitizedParams: Record<string, any> = {};
        
        // Process each parameter
        if (params.type) sanitizedParams.type = params.type.toLowerCase();
        if (params.breed) sanitizedParams.breed = params.breed;
        if (params.size) sanitizedParams.size = params.size.toLowerCase();
        if (params.gender) sanitizedParams.gender = params.gender.toLowerCase();
        if (params.age) sanitizedParams.age = params.age.toLowerCase();
        
        // Process location and distance
        if (params.location && params.location.trim()) {
            sanitizedParams.location = params.location.trim();
            if (params.distance) {
                // Ensure distance is a number
                sanitizedParams.distance = typeof params.distance === 'string' 
                    ? parseInt(params.distance, 10) 
                    : params.distance;
            }
        }
        
        // Pagination
        sanitizedParams.limit = params.limit || 20;
        sanitizedParams.page = params.page || 1;
        
        // Search term
        if (params.name) sanitizedParams.name = params.name;
        
        // Default to adoptable status
        sanitizedParams.status = 'adoptable';
        
        // Add sort by newest
        sanitizedParams.sort = 'recent';
        
        console.log('Searching with sanitized parameters:', sanitizedParams);
        
        try {
            const result = await this.makeRequest('animals', sanitizedParams);
            return result;
        } catch (error) {
            console.error('Error in searchPets:', error);
            throw error;
        }
    }
}

// Export factory function for creating singleton instance
export const createPetfinderAPI = (apiKey: string, apiSecret: string): PetfinderAPI => {
    return PetfinderAPI.getInstance(apiKey, apiSecret);
};

export default PetfinderAPI;