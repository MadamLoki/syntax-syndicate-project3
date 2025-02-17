import { gql } from '@apollo/client';

export const SEARCH_PETFINDER_PETS = gql`
    query SearchPetfinderPets($input: PetfinderSearchInput) {
        searchPetfinderPets(input: $input) {
        animals {
            id
            name
            type
            breeds {
            primary
            secondary
            mixed
            unknown
            }
            age
            gender
            size
            photos {
            small
            medium
            large
            full
            }
            status
            attributes {
            spayed_neutered
            house_trained
            declawed
            special_needs
            shots_current
            }
            contact {
            email
            phone
            address {
                city
                state
                postcode
                country
            }
            }
        }
        pagination {
            count_per_page
            total_count
            current_page
            total_pages
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