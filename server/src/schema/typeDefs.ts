const typeDefs = `
    type Profile {
        _id: ID
        name: String
        username: String
        email: String
        password: String
        skills: [String]!
    }

    type Auth {
        token: ID!
        profile: Profile
    }
    
    input ProfileInput {
        name: String!
        username: String!
        email: String!
        password: String!
    }

    type Pet {
        id: ID!
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
        id: ID!
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

    type Query {
        profiles: [Profile]!
        profile(profileId: ID!): Profile
        me: Profile
        pets: [Pet]!
        pet(id: ID!): Pet
        applications: [Application]!
        application(id: ID!): Application
    }

    type Mutation {
        addProfile(input: ProfileInput!): Auth
        login(email: String!, password: String!): Auth
        removeProfile: Profile
        createPet(input: CreatePetInput!): Pet!
        updatePet(id: ID!, input: UpdatePetInput!): Pet!
        deletePet(id: ID!): Boolean!
        createApplication(input: CreateApplicationInput!): Application!
    }
`;

export default typeDefs;