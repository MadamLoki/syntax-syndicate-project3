import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ThreadDetails from './ThreadDetails';
import { Link } from 'react-router-dom';

const GET_THREADS = gql`
  query GetThreads($id: ID!) {
    threads (id: $id) {
      id
      title
      content
      threadType
      pet(id: $id) {
        id
        name
        species
        image
        breed
        age
        description
      }
      createdAt
      author {
        id
        username
      }
    }
  }
`;

const ThreadListPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_THREADS, {
    onError: (error) => {
      console.error('GraphQL Query Error:', error);
      if (error.networkError && 'result' in error.networkError) {
        console.error('Error Details:', (error.networkError as any).result);
      }
    }
  });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (loading) return <p>Loading threads...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Forum Threads</h2>
        <Link 
          to="/create-thread" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Thread
        </Link>
      </div>
      {data.threads.map((thread: any) => (
        <div
          key={thread.id}
          className="border p-4 mb-4 rounded cursor-pointer hover:bg-gray-100"
          onClick={() => setSelectedThreadId(thread.id)}
        >
          <h3 className="text-xl font-semibold text-blue-600">
            {thread.title} ({thread.threadType})
          </h3>
          {thread.pet && thread.pet.image && (
            <img
              src={thread.pet.image}
              alt={thread.pet.name}
              className="w-32 h-32 object-cover mb-2"
            />
          )}
          <p>{thread.content.substring(0, 100)}...</p>
          <p className="text-sm text-gray-500">By {thread.author.username}</p>
        </div>
      ))}
      {selectedThreadId && (
        <ThreadDetails threadId={selectedThreadId} onClose={() => setSelectedThreadId(null)} />
      )}
    </div>
  );
};

export default ThreadListPage;