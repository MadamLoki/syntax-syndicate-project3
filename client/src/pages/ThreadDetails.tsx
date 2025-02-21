import React from 'react';
import { useQuery, gql } from '@apollo/client';


const GET_THREAD = gql`
 query GetThread($id:ID!){
     thread(id:$id){    
     id
     title
     content
     createdAt
     updatedAt
     author{
         id
         username
     }
     comments{
         id
         content
         createdAt
         author{
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
              <h2 >{thread.title}</h2>
              <p>{thread.content}</p>
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









/*import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';
import { useParams } from 'react-router-dom';


const GET_THREAD = gql`
  query GetThread($id: ID!) {
    thread(id: $id) {
      id
      title
      content
      createdAt
      updatedAt
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

const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        username
      }
    }
  }
`;

const ThreadDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { data, loading, error, refetch } = useQuery(GET_THREAD, { variables: { id } });
    const [commentText, setCommentText] = useState('');
  
    const [createComment, { loading: commentLoading }] = useMutation(CREATE_COMMENT, {
      onCompleted: () => {
        setCommentText('');
        refetch(); // Refresh thread data to show the new comment.
      },
    });

    if (loading) return <p>Loading thread...</p>;
    if (error) return <p>Error loading thread: {error.message}</p>;

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createComment({
          variables: { input: { threadId: id, content: commentText } },
        });
      };
    const { thread } = data;
    
    return ( 
        <div >
        <h2 >{thread.title}</h2>
        <p >{thread.content}</p>
        <p >
          Posted by {thread.author.username} on {new Date(thread.createdAt).toLocaleString()}
        </p>
        <hr/>
        <h3>Comments</h3>
        {thread.comments.map((comment: any) => (
          <div key={comment.id} >
            <p>{comment.content}</p>
            <p >
              By {comment.author.username} on {new Date(comment.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
        <form onSubmit={handleCommentSubmit} >
          <textarea
            placeholder="Write your comment..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            required
          ></textarea>
          <button
            type="submit"
            disabled={commentLoading}
          >
            {commentLoading ? 'Submitting...' : 'Submit Comment'}
          </button>
        </form>
      </div>
    );
         
  };

  export default ThreadDetails;*/