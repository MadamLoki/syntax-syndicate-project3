/*const ForumTypeDefs = `

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

# Use only this CreateThreadInput definition
input CreateThreadInput {
  title: String!
  content: String!
  threadType: String!    # "ADOPTION" or "SURRENDER"
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

type Query {
  threads: [Thread]               
  thread(id: ID!): Thread           
}

type Mutation {
  createThread(input: CreateThreadInput!): Thread!
  createComment(input: CreateCommentInput!): Comment!
}
`;

export default ForumTypeDefs;
*/