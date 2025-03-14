const typeDefs = `
# Base User/Profile Types
type User {
  _id: ID!
  username: String!
  email: String!
}

type Auth {
  token: ID!
  profile: Profile
}

type Profile {
  _id: ID!
  username: String!
  email: String!
  name: String
  profileImage: String
  savedPets: [Pet]
  userPets: [UserPet]
}

type UserPet {
  _id: ID!
  name: String!
  species: String!
  breed: String
  age: Int!
  description: String
  image: String
}

input ProfileInput {
  name: String!
  email: String!
  password: String!
  username: String!
}

input UpdateProfileInput {
  username: String
  email: String
  profileImage: String
}

type ImageUploadResponse {
  url: String!
  publicId: String!
}

# Pet Types
type Pet {
  _id: ID!
  externalId: String
  name: String!
  type: String
  breed: String
  secondaryBreed: String
  age: String
  gender: String
  size: String
  description: String
  images: [String]
  status: String
  shelterId: ID!
  source: String
  organization_id: String
}

input CreatePetInput {
  name: String!
  breed: String
  age: Int
  images: [String]
  status: String
}

input UserPetInput {
  name: String!
  species: String!
  breed: String
  age: Int!
  description: String
  image: String
}

input UpdatePetInput {
  name: String
  breed: String
  age: Int
  images: [String]
  status: String
}

# Petfinder Types
type PetfinderBreed {
  primary: String
  secondary: String
  mixed: Boolean
}

input PetfinderPetInput {
  id: String!
}

type PetfinderPhoto {
  small: String
  medium: String
  large: String
  full: String
}

type PetfinderAttributes {
  spayed_neutered: Boolean
  house_trained: Boolean
  declawed: Boolean
  special_needs: Boolean
  shots_current: Boolean
}

type PetfinderAddress {
  address1: String
  address2: String
  city: String
  state: String
  postcode: String
  country: String
}

type PetfinderContact {
  email: String
  phone: String
  address: PetfinderAddress
}

type PetfinderAnimal {
  id: ID!
  name: String!
  type: String
  breeds: PetfinderBreed
  age: String
  gender: String
  size: String
  colors: PetfinderColors
  photos: [PetfinderPhoto]
  status: String
  attributes: PetfinderAttributes
  environment: PetfinderEnvironment
  organization_id: String
  contact: PetfinderContact
  published_at: String
  distance: Float
  description: String
}

type PetfinderColors {
  primary: String
  secondary: String
  tertiary: String
}

type PetfinderEnvironment {
  children: Boolean
  dogs: Boolean
  cats: Boolean
}

type PetfinderPagination {
  count_per_page: Int
  total_count: Int
  current_page: Int
  total_pages: Int
}

type PetfinderResponse {
  animals: [PetfinderAnimal]
  pagination: PetfinderPagination
}

input PetfinderSearchInput {
  type: String
  breed: String
  size: String
  gender: String
  age: String
  location: String
  distance: Int
  name: String
  page: Int
  limit: Int
}

input PetfinderSaveInput {
  externalId: String!
  name: String!
  type: String!
  breed: String
  age: String
  gender: String
  size: String
  status: String
  images: [String]
  description: String
  shelterId: String
  organization_id: String
}

# Shelter (Petfinder Organizations)
    type ShelterAddress {
        address1: String
        address2: String
        city: String
        state: String
        postcode: String
        country: String
    }

    type Shelter {
        id: ID!
        name: String!
        email: String
        phone: String
        website: String
        mission_statement: String
        address: ShelterAddress
    }

    type ShelterPagination {
        count_per_page: Int
        total_count: Int
        current_page: Int
        total_pages: Int
    }

    type ShelterResponse {
        shelters: [Shelter]
        pagination: ShelterPagination
    }

    input ShelterSearchInput {
        name: String
        location: String
        distance: Int
        state: String
        country: String
        page: Int
        limit: Int
    }

# Application Types
type Application {
  _id: ID!
  petId: ID!
  adopterId: ID
  message: String!
  status: String!
  createdAt: String!
}

input CreateApplicationInput {
  petId: ID!
  message: String!
}

# Forum Types (Using nested pet object)
type thread {
  _id: ID!
  title: String!
  content: String!
  threadType: String!    # "ADOPTION" or "SURRENDER"
  pet: UserPet!
  author: User!
  comments: [comment]
  createdAt: String!
  updatedAt: String!
}

input CreateThreadInput {
  title: String!
  content: String!
  threadType: String!
  pet: UserPetInput!
}

type comment {
 _id: ID!
  thread: thread!
  content: String!
  author: User!
 
  createdAt: String!
  updatedAt: String!
}

input CreateCommentInput {
  threadId: ID!
  content: String!
  parentCommentId: ID
}

# Queries
type Query {
  # User/Profile Queries
  profiles: [Profile]!
  profile(profileId: ID!): Profile
  me: Profile

  # Pet Queries
  pets: [Pet]!
  pet(id: ID!): Pet
  getPetfinderTypes: [String!]!
  getPetfinderBreeds(type: String!): [String!]!
  searchPetfinderPets(input: PetfinderSearchInput): PetfinderResponse
  getPetfinderPet(input: PetfinderPetInput!): PetfinderAnimal

  # Application Queries
  applications: [Application]!
  application(id: ID!): Application

# Shelter Queries
  shelters(location: String): ShelterResponse
  searchShelters(input: ShelterSearchInput): ShelterResponse

  # Forum Queries
  threads: [thread]
  thread(id: ID!): thread
}

# Mutations
type Mutation {

  # User/Profile Mutations
  addProfile(input: ProfileInput!): Auth
  login(username: String!, password: String!): Auth
  removeProfile: Profile
  updateProfile(input: UpdateProfileInput!): Profile
  updateProfileImage(imageUrl: String!): Profile!
  addUserPet(input: UserPetInput!): UserPet
  removeUserPet(petId: ID!): Boolean
  uploadImage(file: String!): ImageUploadResponse!
  savePetfinderPet(input: PetfinderSaveInput!): Profile!
  savePet(petId: ID!): Profile!  
  removeSavedPet(petId: ID!): Profile!

  # Pet Mutations
  createPet(input: CreatePetInput!): Pet!
  updatePet(id: ID!, input: UpdatePetInput!): Pet!
  deletePet(id: ID!): Boolean!

  # Application Mutations
  createApplication(input: CreateApplicationInput!): Application!

  # Forum Mutations
  createThread(input: CreateThreadInput!): thread!
  createComment(input: CreateCommentInput!): comment!
  deleteThread(threadId: ID!): Boolean!
}
`;

export default typeDefs;