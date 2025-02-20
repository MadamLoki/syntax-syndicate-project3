const petfinderSchema = `
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

    extend type Query {
        getPetfinderTypes: [String!]!
        getPetfinderBreeds(type: String!): [String!]!
        searchPetfinderPets(input: PetfinderSearchInput): PetfinderResponse
    }
`;

export default petfinderSchema;