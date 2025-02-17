import { IResolvers } from '@graphql-tools/utils';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

class PetfinderAPI {
    private token: string | null = null;
    private tokenExpiration: number = 0;

    private async getToken(): Promise<string> {
        if (this.token && Date.now() < this.tokenExpiration) {
            return this.token!;
        }

        try {
            const response = await fetch('https://api.petfinder.com/v2/oauth2/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `grant_type=client_credentials&client_id=${process.env.PETFINDER_API_KEY}&client_secret=${process.env.PETFINDER_SECRET}`,
            });

            if (!response.ok) {
                throw new Error('Failed to get access token');
            }

            const data = await response.json();
            this.token = data.access_token;
            this.tokenExpiration = Date.now() + (data.expires_in * 1000);
            
            return this.token!;
        } catch (error) {
            console.error('Error getting Petfinder token:', error);
            throw error;
        }
    }

    async makeRequest(endpoint: string, params?: Record<string, any>) {
        const token = await this.getToken();
        const queryString = params ? new URLSearchParams(params).toString() : '';
        const url = `https://api.petfinder.com/v2/${endpoint}${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Petfinder API error: ${response.status}`);
        }

        return response.json();
    }
}

const petfinderAPI = new PetfinderAPI();

const petfinderResolvers: IResolvers = {
    Query: {
        searchPetfinderPets: async (_: any, { input }: { input: any }) => {
            try {
                // Remove empty values from input
                const cleanInput = Object.entries(input).reduce((acc: any, [key, value]) => {
                    if (value) acc[key] = value;
                    return acc;
                }, {});

                const data = await petfinderAPI.makeRequest('animals', cleanInput);
                return data;
            } catch (error) {
                console.error('Error searching Petfinder pets:', error);
                throw error;
            }
        },

        getPetfinderTypes: async () => {
            try {
                const data = await petfinderAPI.makeRequest('types');
                return data.types.map((type: any) => type.name);
            } catch (error) {
                console.error('Error getting Petfinder types:', error);
                throw error;
            }
        },

        getPetfinderBreeds: async (_: any, { type }: { type: string }) => {
            try {
                const data = await petfinderAPI.makeRequest(`types/${type}/breeds`);
                return data.breeds.map((breed: any) => breed.name);
            } catch (error) {
                console.error('Error getting Petfinder breeds:', error);
                throw error;
            }
        },
    },
};

export default petfinderResolvers;