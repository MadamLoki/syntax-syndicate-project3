import { gql } from '@apollo/client';

export const GET_SHELTERS = gql`
    query Shelters {
      shelters {
        _id
        latitude
        longitude
        contactInfo
      }
    }
`;