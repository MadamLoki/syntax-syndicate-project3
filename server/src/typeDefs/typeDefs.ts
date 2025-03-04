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
  age: String
  gender: String
  size: String
  description: String
  images: [String]
  status: String
  shelterId: ID!
  source: String
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
  photos: [PetfinderPhoto]
  status: String
  attributes: PetfinderAttributes
  contact: PetfinderContact
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
}

# Shelter Types
type Shelter {
  _id: ID!
  latitude: Float!
  longitude: Float!
  contactInfo: String!
}

input CreateShelterInput {
  latitude: Float!
  longitude: Float!
  contactInfo: String!
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
type Thread {
  id: ID!
  title: String!
  content: String!
  threadType: String!    # "ADOPTION" or "SURRENDER"
  pet: UserPet!
  author: User!
  comments: [Comment]
  createdAt: String!
  updatedAt: String!
}

input CreateThreadInput {
  title: String!
  content: String!
  threadType: String!
  pet: UserPetInput!
}

type Comment {
  id: ID!
  thread: Thread!
  content: String!
  author: User!
  parentComment: Comment
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

  # Application Queries
  applications: [Application]!
  application(id: ID!): Application

  # Shelter Queries
  shelters: [Shelter]!

  # Forum Queries
  threads: [Thread]
  thread(id: ID!): Thread
}

# Mutations
type Mutation {
  # User/Profile Mutations
  addProfile(input: ProfileInput!): Auth
  login(username: String!, password: String!): Auth
  removeProfile: Profile
  updateProfile(input: UpdateProfileInput!): Profile
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

  # Shelter Mutations
  createShelter(input: CreateShelterInput!): Shelter!

  # Forum Mutations
  createThread(input: CreateThreadInput!): Thread!
  createComment(input: CreateCommentInput!): Comment!
}
`;

export default typeDefs;
