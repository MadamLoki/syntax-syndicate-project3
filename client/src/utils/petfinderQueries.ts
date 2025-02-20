import { gql } from '@apollo/client';

// Simplified query to just get types first
export const GET_PETFINDER_TYPES = gql`
    query GetPetfinderTypes {
        getPetfinderTypes
    }
`;

// Only request breeds when we have a type
export const GET_PETFINDER_BREEDS = gql`
    query GetPetfinderBreeds($type: String!) {
        getPetfinderBreeds(type: $type)
    }
`;

// Simplified search query
export const SEARCH_PETFINDER_PETS = gql`
    query SearchPetfinderPets($input: PetfinderSearchInput) {
        searchPetfinderPets(input: $input) {
        animals {
            id
            name
            type
            breeds {
            primary
            }
            age
            size
            photos {
            medium
            }
            contact {
            address {
                city
                state
            }
            }
        }
        }
    }
`;