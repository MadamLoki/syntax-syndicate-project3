import React from 'react';
import { useMutation, gql } from '@apollo/client';

const DELETE_THREAD = gql`
  mutation DeleteThread($threadId: ID!) {
    deleteThread(threadId: $threadId)
  }
`;

interface Thread {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    username: string;
  };
}

interface ThreadCardProps {
  thread: Thread;
  refetchThreads: () => void;
}

function ThreadCard({ thread, refetchThreads }: ThreadCardProps) {
  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem('userId');
  
  // Set up delete mutation
  const [deleteThread, { loading }] = useMutation(DELETE_THREAD, {
    onCompleted: () => {
      // Refetch threads to update the list
      refetchThreads();
    }
  });
  
  // Check if the current user is the author
  const isAuthor = thread.author._id === currentUserId;
  
  // Handle delete click
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this thread? This cannot be undone.")) {
      deleteThread({ variables: { threadId: thread._id } });
    }
  };
  
  return (
    <div className="border rounded p-4 mb-4">
      <h3 className="text-xl font-bold">{thread.title}</h3>
      <p className="text-gray-600">{thread.content.substring(0, 100)}...</p>
      <div className="flex justify-between mt-4">
        <div>
          <span className="text-sm text-gray-500">
            Posted by {thread.author.username}
          </span>
        </div>
        <div>
          {isAuthor && (
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="text-red-600 hover:text-red-800"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ThreadCard;