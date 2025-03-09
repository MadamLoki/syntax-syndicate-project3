import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ThreadDetails from './ThreadDetails';
import { Link } from 'react-router-dom';

const GET_THREADS = gql`
  query GetThreads {
    threads {
      _id
      title
      content
      threadType
      pet {
        _id
        name
        species
        image
        breed
        age
        description
      }
      createdAt
      author {
        _id
        username
      }
    }
  }
`;

const ThreadListPage = () => {
  const { data, loading, error } = useQuery(GET_THREADS, {
    onError: (error) => {
      console.error('GraphQL Query Error:', error);
      if (error.networkError && 'result' in error.networkError) {
        console.error('Error Details:', (error.networkError).result);
      }
    }
  });
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Show loading state while data is being fetched
  if (loading) return <p className="text-center my-8">Loading threads...</p>;
  
  // Show error message if the query failed
  if (error) return (
    <div className="text-center my-8 text-red-600">
      <p>Error loading threads: {error.message}</p>
      <p>Please try refreshing the page or contact support if the problem persists.</p>
    </div>
  );
  
  // Show a message if no threads are found
  if (!data || !data.threads || data.threads.length === 0) {
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
        <p className="text-center my-8">No threads found. Be the first to create one!</p>
      </div>
    );
  }

  // Format the date to be more readable
  const formatDate = (dateString: string | number | Date) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

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
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data.threads.map((thread: { _id: string; title: string; threadType: string; pet: { image: string; name: string; }; content: string; author: { username: string; }; createdAt: string; }) => (
          <div
            key={thread._id}
            className="border p-4 rounded cursor-pointer hover:bg-gray-50 transition duration-200 shadow-sm"
            onClick={() => setSelectedThreadId(thread._id)}
          >
            <h3 className="text-xl font-semibold text-blue-600 mb-2">
              {thread.title}
            </h3>
            <div className="text-xs font-medium bg-gray-100 rounded-full px-3 py-1 mb-3 inline-block">
              {thread.threadType === 'ADOPTION' ? 'Looking to Adopt' : 'Giving Up for Adoption'}
            </div>
            
            {thread.pet && thread.pet.image && (
              <img
                src={thread.pet.image}
                alt={`${thread.pet.name || 'Pet'}`}
                className="w-full h-48 object-cover rounded-md mb-3"
                onError={(e) => {
                  (e.target as HTMLImageElement).onerror = null;
                  (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                }}
              />
            )}
            
            <p className="text-gray-700 mb-3">
              {thread.content ? (
                thread.content.length > 100 
                  ? `${thread.content.substring(0, 100)}...` 
                  : thread.content
              ) : 'No description provided'}
            </p>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <p>By {thread.author?.username || 'Unknown'}</p>
              <p>{formatDate(thread.createdAt)}</p>
            </div>
          </div>
        ))}
      </div>
      
      {selectedThreadId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <ThreadDetails 
              threadId={selectedThreadId} 
              onClose={() => setSelectedThreadId(null)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadListPage;