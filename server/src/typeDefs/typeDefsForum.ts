const ForumTypeDefs = `

type Thread {
  id: ID!
  title: String!
  content: String!
  author: User!           
  comments: [Comment]
  createdAt: String!
  updatedAt: String!
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