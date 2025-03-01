// ThreadDetails.tsx
import React from 'react';
import { useQuery, gql } from '@apollo/client';

const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      id
      title
      content
      threadType
      pet {
        name
        species
        breed
        age
        description
        image
      }
      createdAt
      author {
        id
        username
      }
      comments {
        id
        content
        createdAt
        author {
          id
          username
        }
      }
    }
  }
`;

type ThreadDetailsProps = {
  threadId: string;
  onClose: () => void;
};

const ThreadDetails: React.FC<ThreadDetailsProps> = ({ threadId, onClose }) => {
  const { data, loading, error } = useQuery(GET_THREAD, {
    variables: { id: threadId },
  });

  if (loading) return <p>Loading thread details...</p>;
  if (error) return <p>Error loading details: {error.message}</p>;

  const { thread } = data;

  return (
    <div className="border-t mt-4 pt-4">
      <button onClick={onClose} className="mb-4 text-blue-500 underline">
        Close Details
      </button>
      <h2 className="text-2xl font-bold">
        {thread.title} ({thread.threadType})
      </h2>
      <p>{thread.content}</p>
      {thread.pet && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold">Pet Information</h3>
          <p>Name: {thread.pet.name}</p>
          <p>Species: {thread.pet.species}</p>
          {thread.pet.breed && <p>Breed: {thread.pet.breed}</p>}
          <p>Age: {thread.pet.age}</p>
          {thread.pet.description && <p>Description: {thread.pet.description}</p>}
          {thread.pet.image && (
            <img
              src={thread.pet.image}
              alt={thread.pet.name}
              className="w-48 h-48 object-cover mt-2"
            />
          )}
        </div>
      )}
      <p className="text-sm text-gray-500">
        Posted by {thread.author.username} on {new Date(thread.createdAt).toLocaleString()}
      </p>
      <h3 className="text-xl mt-4">Comments</h3>
      {thread.comments.map((comment: any) => (
        <div key={comment.id} className="border p-2 mt-2 rounded">
          <p>{comment.content}</p>
          <p className="text-sm text-gray-500">
            By {comment.author.username} on {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ThreadDetails;
