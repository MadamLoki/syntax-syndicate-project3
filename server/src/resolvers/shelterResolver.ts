import { IResolvers } from '@graphql-tools/utils';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

// Load environment variables
dotenv.config();

const PETFINDER_API_URL = 'https://api.petfinder.com/v2/organizations';

// Function to get the OAuth2 token from Petfinder API
const getPetfinderAuthToken = async () => {
    const apiKey = process.env.PETFINDER_API_KEY || "";
    const apiSecret = process.env.PETFINDER_SECRET || "";

    const authUrl = 'https://api.petfinder.com/v2/oauth2/token';
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', apiKey);
    params.append('client_secret', apiSecret);

    try {
        const response = await fetch(authUrl, {
            method: 'POST',
            body: params
        });

        if (!response.ok) {
            throw new Error(`Error fetching OAuth token: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        console.error('Error getting Petfinder OAuth token:', error);
        throw new Error('Failed to get Petfinder OAuth token');
    }
};

const shelterResolvers: IResolvers = {
    Query: {
        // Fetch shelters from Petfinder API with optional location filter
        shelters: async (_: any, { location }: { location?: string }, context: any) => {
            try {
                const token = await getPetfinderAuthToken(); // Get OAuth2 token

                const url = new URL(PETFINDER_API_URL);
                if (location) {
                    url.searchParams.append('location', location); // Append location if provided
                }

                const response = await fetch(url.toString(), {
                    method: 'GET',
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (!response.ok) {
                    throw new Error(`Petfinder API error: ${response.statusText}`);
                }

                const data = await response.json();
                return {
                    shelters: data.organizations,
                    pagination: data.pagination
                };
            } catch (error) {
                console.error('Error fetching Petfinder shelters:', error);
                throw new Error('Failed to fetch shelters');
            }
        }
    }
};

export default shelterResolvers;
