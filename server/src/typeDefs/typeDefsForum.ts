const ForumTypeDefs = `

type UserPet {
  _id: ID!
  name: String!
  species: String!
  breed: String
  age: Int!
  description: String
  image: String
}

input UserPetInput {
  name: String!
  species: String!
  breed: String
  age: Int!
  description: String
  image: String
}

type Thread {
  id: ID!
  title: String!
  content: String!
  threadType: String!
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

# Input Types

input CreateThreadInput {
  title: String!
  content: String!
  threadType: String!    # "ADOPTION" or "SURRENDER"
  petId: ID              # Provide the pet's ID instead of images
}

input CreateCommentInput {
  threadId: ID!
  content: String!
  parentCommentId: ID  
}

# Queries

type Query {
  threads: [Thread]               
  thread(id: ID!): Thread           
}

# Mutations

type Mutation {
  createThread(input: CreateThreadInput!): Thread!
  createComment(input: CreateCommentInput!): Comment!
}
`;

export default ForumTypeDefs;