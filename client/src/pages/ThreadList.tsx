import React, { useState }from 'react';
import { useQuery, gql } from '@apollo/client'
import ThreadDetails from '../pages/ThreadDetails';

const GET_THREADS = gql`
    query GetThreads {
        threads {
        id
        title
        createdAt
        updatedAt
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
    if (error) return <p>Error loading threads: {error.message}</p>;

    return (
        <div >
          <h2 >Forum Threads</h2>
          {data.threads.map((thread: any) => (
            <div
              key={thread.id}
              
              onClick={() => setSelectedThreadId(thread.id)}
            >
              <h3 >
                {thread.title}
              </h3>
              <p>{thread.content.substring(0, 100)}...</p>
              <p >By {thread.author.username}</p>
            </div>
          ))}
          {/* Render the thread details below the list if a thread is selected */}
          {selectedThreadId && (
            <ThreadDetails threadId={selectedThreadId} onClose={() => setSelectedThreadId(null)} />
          )}
        </div>
      );
    };
    
    export default ThreadListPage;




    /* function ThreadDetails({ threadId, onClose }: { threadId: string; onClose: () => void }) {
        const { data, loading, error } = useQuery(GET_THREAD, { variables: { id: threadId } 
        });

        if (loading) return <p>Loading thread...</p>;
        if (error) return <p>Error loading thread: {error.message}</p>;

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
            <h3>Comments</h3>
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
      }
        
      export default function ThreadListingPage(){
        const { data, loading, error } = useQuery(GET_THREADS);
        const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
    
        if (loading) return <p>Loading threads...</p>;
        if (error) return <p>Error loading threads: {error.message}</p>;
    
        return (
            <div >
            <h2 >Forum Threads</h2>
            {data.threads.map((thread: any) => (
              <div
                key={thread.id}
               
                onClick={() => setSelectedThreadId(thread.id)}
              >
                <h3 >{thread.title}</h3>
                <p>{thread.content.substring(0, 100)}...</p>
                <p >By {thread.author.username}</p>
              </div>
            ))}
            {/* Render the thread details below the list if a thread is selected }
            {selectedThreadId && (
                <ThreadDetails threadId={selectedThreadId} onClose={() => setSelectedThreadId(null)} />
              )}
            </div>
          );
        }
            */
       
    


    