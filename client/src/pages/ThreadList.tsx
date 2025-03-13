import React, { useState, useEffect } from 'react';
import { useQuery, gql } from '@apollo/client';
import ThreadDetails from './ThreadDetails';
import { Link, useLocation } from 'react-router-dom';

// Define the query for fetching threads
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
  // Get location to detect navigation changes
  const location = useLocation();
  
  // State for the selected thread
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  
  // Query for threads with network-only policy to ensure fresh data
  const { data, loading, error, refetch } = useQuery(GET_THREADS, {
    fetchPolicy: 'network-only', // e don't use cached data
    onError: (error) => {
      console.error('GraphQL Query Error:', error);
      if (error.networkError && 'result' in error.networkError) {
        console.error('Error Details:', error.networkError.result);
      }
    }
  });
  
  // Effect to refetch data when the user navigates back to this page
  useEffect(() => {
   
    refetch();
    
    // Log to confirm refetching
    console.log('Refetching threads data');
  }, [refetch, location.key]); // location.key changes on navigation

  // Format date for display
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

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="flex justify-center items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          <p>Loading threads...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <p className="font-bold">Error</p>
          <p>{error.message}</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || !data.threads || data.threads.length === 0) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Forum Threads</h2>
          <Link 
            to="/create-thread" 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Create Thread
          </Link>
        </div>
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">No threads found.</p>
          <p>Be the first to create a discussion about pet adoption!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Forum Threads</h2>
        <Link 
          to="/create-thread" 
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Thread
        </Link>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data.threads.map((thread: { _id: React.Key; pet: { image: string | undefined; name: any; }; title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; threadType: string; content: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; author: { username: any; }; createdAt: any; }) => (
          <div
            key={thread._id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 bg-white"
            onClick={() => setSelectedThreadId(thread._id.toString())}
          >
            {thread.pet && thread.pet.image && (
              <div className="h-48 overflow-hidden">
                <img
                  src={thread.pet.image}
                  alt={`${thread.pet.name || 'Pet'}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
              </div>
            )}
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-blue-600 truncate">
                  {thread.title}
                </h3>
                <span className={`text-xs font-medium ${
                  thread.threadType === 'ADOPTION' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-orange-100 text-orange-800'
                } rounded-full px-2 py-1 whitespace-nowrap ml-2`}>
                  {thread.threadType === 'ADOPTION' ? 'Looking to Adopt' : 'Giving Up'}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3 line-clamp-3">
                {thread.content}
              </p>
              
              <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
                <p>By {thread.author?.username || 'Unknown'}</p>
                <p>{formatDate(thread.createdAt)}</p>
              </div>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedThreadId(thread._id.toString());
                }}
                className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded transition-colors duration-200"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Thread details modal */}
      {selectedThreadId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <ThreadDetails 
                threadId={selectedThreadId} 
                onClose={() => setSelectedThreadId(null)} 
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Refresh button at the bottom */}
      <div className="mt-8 text-center">
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Threads
        </button>
      </div>
    </div>
  );
};

export default ThreadListPage;