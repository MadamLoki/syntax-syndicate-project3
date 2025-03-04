import { gql } from "@apollo/client"

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      profile {
        _id
        username
        email
      }
    }
  }
`;

export const ADD_PROFILE = gql`
  mutation addProfile($input: ProfileInput!) {
    addProfile(input: $input) {
      token
      profile {
        _id
        name
        email
      }
    }
  }
`;

export const ADD_SHELTER = gql`
    mutation CreateShelter($createShelterInput2: CreateShelterInput!) {
      createShelter(input: $createShelterInput2) {
        _id
        contactInfo
        latitude
        longitude
      }
    }
`;

export const SAVE_PET = gql`
  mutation SavePetfinderPet($input: PetfinderSaveInput!) {
    savePetfinderPet(input: $input) {
      _id
      username
      email
      savedPets {
        _id
        name
        type
        breed
        images
      }
    }
  }
`;

export const REMOVE_SAVED_PET = gql`
  mutation RemoveSavedPet($petId: ID!) {
    removeSavedPet(petId: $petId) {
      _id
      savedPets {
        _id
      }
    }
  }
`;