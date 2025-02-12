const petForm=`

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
  adopterId: ID  // This may be null if the adopter isn’t registered
  message: String!
  status: String!  // "Pending", "Reviewed", "Accepted", "Rejected"
  createdAt: String!
}

input CreateApplicationInput {
  petId: ID!
  message: String!
}
  type Mutation {
  
  createPet(input: CreatePetInput!): Pet!
  updatePet(id: ID!, input: UpdatePetInput!): Pet!
  deletePet(id: ID!): Boolean!

  
  createApplication(input: CreateApplicationInput!): Application!
}
  `;
