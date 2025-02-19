const ForumTypeDefs = `# GraphQL Types

type Thread {
  id: ID!
  title: String!
  content: String!
  author: User!           # assuming you have a User type defined
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
  parentCommentId: ID  # optional, if this is a reply to another comment
}

# Queries

type Query {
  threads: [Thread]               # Fetch all threads
  thread(id: ID!): Thread           # Fetch a single thread with its comments
}

# Mutations

type Mutation {
  createThread(input: CreateThreadInput!): Thread!
  createComment(input: CreateCommentInput!): Comment!
}
`;