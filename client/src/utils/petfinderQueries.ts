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
                    secondary
                    mixed
                }
                age
                gender
                size
                colors {
                    primary
                    secondary
                    tertiary
                }
                attributes {
                    spayed_neutered
                    house_trained
                    declawed
                    special_needs
                    shots_current
                }
                environment {
                    children
                    dogs
                    cats
                }
                description
                organization_id
                photos {
                    small
                    medium
                    large
                    full
                }
                status
                published_at
                distance
                contact {
                    email
                    phone
                    address {
                        address1
                        address2
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