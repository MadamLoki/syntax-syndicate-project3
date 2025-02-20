import React from 'react';
import { useQuery, gql } from '@apollo/client'
import { Link } from 'react-router-dom';

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

    const ThreadList: React.FC = () => {
        const { data, loading, error} = useQuery(GET_THREADS);

        if (loading) return <p>Loading threads...</p>;
        if (error) return <p>Error loading threads: {error.message}</p>;
        return (
            <div >
            <h2 >Forum Threads</h2>
            {data.threads.map((thread: any) => (
              <div key={thread.id}>
                <Link to={`/threads/${thread.id}`}>
                  <h3 >
                    {thread.title}
                  </h3>
                </Link>
                <p >{thread.content.substring(0, 100)}...</p>
                <p>
                  By {thread.author.username} on {new Date(thread.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        );
      };
      
      export default ThreadList;