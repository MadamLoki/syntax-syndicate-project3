const petfinderSchema = `
    type Query {
        getPetfinderTypes: [String!]! @cacheControl(maxAge: 3600)
        getPetfinderBreeds(type: String!): [String!]!
        searchPetfinderPets(input: PetfinderSearchInput): PetfinderResponse
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

    type PetfinderResponse {
        animals: [PetfinderAnimal]
        pagination: PetfinderPagination
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
`;

export default petfinderSchema;