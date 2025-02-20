const typeDefs = `
    type Profile {
        _id: ID
        name: String
        username: String
        email: String
        password: String
        skills: [String]!
    }

    input ProfileInput {
        name: String!
        email: String!
        password: String!
        username: String!
    }

    type Pet {
        _id: ID!
        name: String!
        breed: String
        age: Int
        images: [String]
        status: String
        shelterId: ID!
    }

    input CreatePetInput {
        name: String!
        breed: String
        age: Int
        images: [String]
        status: String
    }

    input UpdatePetInput {
        name: String
        breed: String
        age: Int
        images: [String]
        status: String
    }

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

    type Shelter {
        _id: ID!
        name: String!
        latitude: Float!
        longitude: Float!
        contactInfo: String!
    }

    input CreateShelterInput {
        name: String!
        latitude: Float!
        longitude: Float!
        contactInfo: String!
    }

    type Auth {
        token: ID!
        profile: Profile
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

    type PetfinderBreed {
        primary: String
        secondary: String
        mixed: Boolean
        unknown: Boolean
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

    type PetfinderContact {
        email: String
        phone: String
        address: PetfinderAddress
    }

    type PetfinderAddress {
        city: String
        state: String
        postcode: String
        country: String
    }

    type PetfinderAnimal {
        id: ID!
        name: String!
        type: String!
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

    type Query {
        profiles: [Profile]!
        profile(profileId: ID!): Profile
        me: Profile
        pets: [Pet]!
        pet(id: ID!): Pet
        applications: [Application]!
        application(id: ID!): Application
        shelters: [Shelter]!
        getPetfinderTypes: [String!]!
        getPetfinderBreeds(type: String!): [String!]!
        searchPetfinderPets(input: PetfinderSearchInput): PetfinderResponse
    }

    type Mutation {
        addProfile(input: ProfileInput!): Auth
        login(username: String!, password: String!): Auth
        removeProfile: Profile
        createPet(input: CreatePetInput!): Pet!
        updatePet(id: ID!, input: UpdatePetInput!): Pet!
        deletePet(id: ID!): Boolean!
        createApplication(input: CreateApplicationInput!): Application!
        createShelter(input: CreateShelterInput!): Shelter!
    }
`;

export default typeDefs;