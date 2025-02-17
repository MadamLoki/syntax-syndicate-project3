// client/src/utils/queries.ts

import { gql } from '@apollo/client';

export const SEARCH_PETFINDER_PETS = gql`
    query SearchPetfinderPets($input: PetfinderSearchInput!) {
        searchPetfinderPets(input: $input) {
        animals {
            id
            name
            type
            breeds {
            primary
            secondary
            mixed
            }
            age
            gender
            size
            photos {
            medium
            large
            }
            status
            contact {
            email
            phone
            address {
                city
                state
            }
            }
        }
        pagination {
            current_page
            total_pages
            total_count
        }
        }
    }
`;

export const GET_PETFINDER_TYPES = gql`
    query GetPetfinderTypes {
        getPetfinderTypes
    }
`;

export const GET_PETFINDER_BREEDS = gql`
    query GetPetfinderBreeds($type: String!) {
        getPetfinderBreeds(type: $type)
    }
`;