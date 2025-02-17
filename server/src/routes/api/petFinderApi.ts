import fetch from 'node-fetch';
import dotenv from 'dotenv';
import { ApolloError } from 'apollo-server-errors';

dotenv.config();

interface PetfinderToken {
    token: string;
    expiresAt: number;
}

interface PetfinderAuthResponse {
    access_token: string;
    expires_in: number;
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
}

class PetfinderAPI {
    private static instance: PetfinderAPI;
    private token: string | null = null;
    private tokenExpiration: number = 0;
    private baseUrl = 'https://api.petfinder.com/v2';

    private constructor() { }

    public static getInstance(): PetfinderAPI {
        if (!PetfinderAPI.instance) {
            PetfinderAPI.instance = new PetfinderAPI();
        }
        return PetfinderAPI.instance;
    }

    private async getToken(): Promise<string> {
        // Check if we have a valid token
        if (this.token && Date.now() < this.tokenExpiration) {
            return this.token;
        }

        try {
            const response = await fetch(`${this.baseUrl}/oauth2/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'grant_type': 'client_credentials',
                    'client_id': process.env.PETFINDER_API_KEY || '',
                    'client_secret': process.env.PETFINDER_SECRET || '',
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to get access token: ${response.statusText}`);
            }

            const data = await response.json();
            this.token = data.access_token;
            // Set expiration to slightly before the actual expiration to be safe
            this.tokenExpiration = Date.now() + (data.expires_in * 1000) - 60000; // Subtract 1 minute
            return this.token!;
        } catch (error) {
            console.error('Error getting token:', error);
            throw new ApolloError('Failed to authenticate with Petfinder API', (error as Error).message);
        }
    }

    private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
        try {
            const token = await this.getToken();
            const queryString = new URLSearchParams(params).toString();
            const url = `${this.baseUrl}/${endpoint}${queryString ? `?${queryString}` : ''}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Petfinder API error: ${response.status} ${response.statusText}`);
            }

            return response.json();
        } catch (error) {
            console.error(`Error making request to ${endpoint}:`, error);
            throw new ApolloError('Failed to authenticate with Petfinder API', (error as Error).message);
        }
    }

    // Public methods for GraphQL resolvers
    public async getTypes() {
        const response = await this.makeRequest<{ types: { name: string }[] }>('types');
        return response.types.map((type) => type.name);
    }

    public async getBreeds(type: string) {
        const response = await this.makeRequest<{ breeds: { name: string }[] }>(`types/${type}/breeds`);
        return response.breeds.map((breed) => breed.name);
    }

    public async searchPets(params: Record<string, any>) {
        return this.makeRequest('animals', params);
    }
}

export default PetfinderAPI.getInstance();