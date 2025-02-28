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
      petId
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
    <div >
      <button onClick={onClose} >
        Close Details
      </button>
      <h2 >
        {thread.title} ({thread.threadType})
      </h2>
      <p>{thread.content}</p>
      {thread.petId && (
        <p >Related Pet ID: {thread.petId}</p>
      )}
      <p >
        Posted by {thread.author.username} on {new Date(thread.createdAt).toLocaleString()}
      </p>
      <h3 >Comments</h3>
      {thread.comments.map((comment: any) => (
        <div key={comment.id} >
          <p>{comment.content}</p>
          <p >
            By {comment.author.username} on {new Date(comment.createdAt).toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
};

export default ThreadDetails;
