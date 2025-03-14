import { gql } from "@apollo/client"

export const LOGIN_USER = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      profile {
        _id
        username
        email
        profileImage
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
        profileImage
      }
    }
  }
`;

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      _id
      username
      email
      profileImage
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
        age
        gender
        size
        status
        description
        images
        shelterId
        source
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