import { gql } from '@apollo/client';

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
            pagination {
                count_per_page
                total_count
                current_page
                total_pages
            }
        }
    }
`;