import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

// Query to fetch thread details including comments
const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      _id
      title
      content
      threadType
      pet {
        _id
        name
        species
        breed
        age
        description
        image
      }
      createdAt
      author {
        _id
        username
        email
      }
      comments {
        _id
        content
        createdAt
        author {
          _id
          username
          email
        }
      }
    }
  }
`;

// Properly structured mutation matching your GraphQL schema
const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      _id
      content
      createdAt
      author {
        _id
        username
      }
      thread {
        _id
      }
    }
  }
`;

// New mutation for deleting a thread - updated to match your resolver parameter name
const DELETE_THREAD = gql`
  mutation DeleteThread($threadId: ID!) {
    deleteThread(threadId: $threadId)
  }
`;

interface ThreadDetailsProps {
  threadId: string;
  onClose: () => void;
  currentUserId?: string; // Add this to check if current user is the author
}

const ThreadDetails: React.FC<ThreadDetailsProps> = ({ threadId, onClose, currentUserId }) => {
  // State for the comment form
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Query to fetch thread data
  const { data, loading, error, refetch } = useQuery(GET_THREAD, {
    variables: { id: threadId },
    fetchPolicy: 'network-only', // Forces a network request instead of using cache
    onError: (error) => {
      console.error('Error fetching thread:', error);
    }
  });

  // Mutation to create a comment
  const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT, {
    onCompleted: () => {
      // Clear the form and refresh the thread data to show the new comment
      setCommentContent('');
      setCommentError('');
      refetch(); // This is crucial - it refreshes the thread data
    },
    onError: (error) => {
      console.error('Error creating comment:', error);
      setCommentError('Failed to post comment: ' + error.message);
    }
  });

  // Mutation to delete a thread
  const [deleteThread, { loading: deleteLoading }] = useMutation(DELETE_THREAD, {
    onCompleted: (data) => {
      // Show success message if needed
      console.log('Thread deleted successfully');
      
      // Trigger a page refresh or redirect
      window.location.reload(); // This will refresh the current page
      
      // Alternatively, you can just close the modal
      // onClose(); // Close the details and return to list view
    },
    onError: (error) => {
      console.error('Error deleting thread:', error);
      setDeleteError('Failed to delete thread: ' + error.message);
      setShowDeleteConfirm(false);
    }
  });

  // Handle comment submission
  const handleCommentSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    
    // Validate the comment
    if (!commentContent.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    // Submit the comment with the correct input structure
    createComment({
      variables: {
        input: {
          threadId: threadId,
          content: commentContent
          // parentCommentId is optional, so we omit it for top-level comments
        }
      }
    });
  };

  // Handle thread deletion
  const handleDeleteThread = () => {
    deleteThread({
      variables: { threadId: threadId }
    });
  };

  // Format dates for display
  const formatDate = (dateString: string | number | Date) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
        <p>Loading thread details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600 mb-4">Error loading details: {error.message}</p>
        <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  // No data state
  if (!data || !data.thread) {
    return (
      <div className="p-6 text-center">
        <p className="mb-4">Thread not found or has been removed.</p>
        <button onClick={onClose} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Go Back
        </button>
      </div>
    );
  }

  const { thread } = data;
  
  // Check if current user is the author of the thread
  // For testing, we'll make delete option available to all users until authentication is fully implemented
  const isAuthor = true; // Temporarily set to true so delete button always shows
  // Later you can revert to: currentUserId && thread.author && currentUserId === thread.author._id;
  
  // Debug log to check if comments are being received
  console.log('Thread data received:', thread);
  console.log('Comments received:', thread.comments || []);

  return (
    <div className="pb-6">
      {/* Header with close button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Thread Details</h2>
        <button 
          onClick={onClose} 
          className="text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Thread title and type */}
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{thread.title}</h2>
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {thread.threadType === 'ADOPTION' ? 'Looking to Adopt' : 'Giving Up for Adoption'}
            </span>
          </div>
          
          {/* Delete button - made visible for all users for now */}
          <div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-800 px-3 py-1 rounded border border-red-600 hover:border-red-800"
              disabled={deleteLoading}
            >
              Delete Thread
            </button>
          </div>
        </div>
      </div>

      {/* Thread content */}
      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <p className="whitespace-pre-line">{thread.content}</p>
      </div>

      {/* Pet information section */}
      {thread.pet && (
        <div className="border rounded-lg p-4 mb-6">
          <h3 className="text-xl font-semibold mb-3">Pet Information</h3>
          <div className="flex flex-col md:flex-row gap-6">
            {thread.pet.image && (
              <div className="md:w-1/3">
                <img
                  src={thread.pet.image}
                  alt={thread.pet.name || 'Pet'}
                  className="w-full max-w-xs rounded-lg object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).onerror = null;
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x400?text=No+Image';
                  }}
                />
              </div>
            )}
            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <p><span className="font-medium">Name:</span> {thread.pet.name}</p>
                <p><span className="font-medium">Species:</span> {thread.pet.species}</p>
                <p><span className="font-medium">Age:</span> {thread.pet.age} {thread.pet.age === 1 ? 'year' : 'years'}</p>
                {thread.pet.breed && <p><span className="font-medium">Breed:</span> {thread.pet.breed}</p>}
              </div>
              {thread.pet.description && (
                <div className="mt-3">
                  <p className="font-medium mb-1">Description:</p>
                  <p className="text-gray-700">{thread.pet.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Author and date information */}
      <p className="text-sm text-gray-500 mb-8">
        Posted by {thread.author?.username || 'Unknown'} on {formatDate(thread.createdAt)}
      </p>

      {/* Comment form section */}
      <div className="border-t pt-6 mb-8">
        <h3 className="text-xl font-semibold mb-4">Add a Comment</h3>
        <form onSubmit={handleCommentSubmit}>
          <textarea
            className="w-full border rounded-lg p-3 mb-3 min-h-[100px]"
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            placeholder="Share your thoughts about this pet..."
            disabled={commentLoading}
            required
          ></textarea>
          
          {commentError && (
            <p className="text-red-600 mb-3">{commentError}</p>
          )}
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            disabled={commentLoading || !commentContent.trim()}
          >
            {commentLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>

      {/* Comments section */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          Comments ({thread.comments?.length || 0})
        </h3>
        
        {thread.comments && thread.comments.length > 0 ? (
          <div className="space-y-4">
            {thread.comments.map((comment: { _id: React.Key | null | undefined; content: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined; author: { username: any; }; createdAt: any; }) => (
              <div key={comment._id} className="border p-4 rounded-lg bg-gray-50">
                <p className="mb-3 whitespace-pre-line">{comment.content}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{comment.author?.username || 'Unknown'}</span>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Thread</h3>
            <p className="mb-6">Are you sure you want to delete this thread? This action cannot be undone.</p>
            
            {deleteError && (
              <p className="text-red-600 mb-4">{deleteError}</p>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteThread}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:bg-red-300"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Thread'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreadDetails;