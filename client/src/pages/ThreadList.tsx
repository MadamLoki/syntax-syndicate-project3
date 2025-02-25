
import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ThreadDetails from './ThreadDetails';
import { Link } from 'react-router-dom';

const GET_THREADS = gql`
  query GetThreads {
    threads {
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
    }
  }
`;

const ThreadListPage: React.FC = () => {
  const { data, loading, error } = useQuery(GET_THREADS);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  if (loading) return <p>Loading threads...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div >
      <div >
        <h2 >Forum Threads</h2>
        <Link 
          to="/create-thread" 
          
        >
          Create Thread
        </Link>
      </div>
      {data.threads.map((thread: any) => (
        <div
          key={thread.id}
          
          onClick={() => setSelectedThreadId(thread.id)}
        >
          <h3 >
            {thread.title} ({thread.threadType})
          </h3>
          {thread.petId && (
            <p >Pet ID: {thread.petId}</p>
          )}
          <p>{thread.content.substring(0, 100)}...</p>
          <p >By {thread.author.username}</p>
        </div>
      ))}
      {selectedThreadId && (
        <ThreadDetails 
          threadId={selectedThreadId} 
          onClose={() => setSelectedThreadId(null)} 
        />
      )}
    </div>
  );
};

export default ThreadListPage;
