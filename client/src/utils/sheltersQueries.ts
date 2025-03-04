import { gql } from "@apollo/client";

export const GET_SHELTERS = gql`
    query GetShelters($location: String) {
        shelters(location: $location) {
            shelters {
                id
                name
                address {
                    address1
                    address2
                    city
                    state
                }
            }
        }
    }
`;