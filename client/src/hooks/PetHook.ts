import { gql } from '@apollo/client';

export const GET_PETS = gql`
  query GetPets(
    $searchTerm: String
    $type: String
    $breed: String
    $age: String
    $status: String
    $limit: Int
    $offset: Int
  ) {
    pets(
      searchTerm: $searchTerm
      type: $type
      breed: $breed
      age: $age
      status: $status
      limit: $limit
      offset: $offset
    ) {
      id
      name
      type
      breed
      age
      status
      images
      shelterId
    }
  }
`;

export const GET_PET = gql`
  query GetPet($id: ID!) {
    pet(id: $id) {
      id
      name
      type
      breed
      age
      status
      images
      shelterId
    }
  }
`;