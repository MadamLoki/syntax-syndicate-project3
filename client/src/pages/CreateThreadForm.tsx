// CreateThreadForm.tsx
import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const CREATE_THREAD = gql`
  mutation CreateThread($input: CreateThreadInput!) {
    createThread(input: $input) {
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

const CreateThreadForm: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [threadType, setThreadType] = useState('ADOPTION'); // Default selection
  const [petId, setPetId] = useState(''); // New field for pet ID

  const [createThread, { loading, error }] = useMutation(CREATE_THREAD, {
    onCompleted: () => {
      navigate('/forum'); // Navigate back to forum after creation
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createThread({
        variables: { input: { title, content, threadType, petId } },
      });
    } catch (err) {
      console.error('Error creating thread:', err);
    }
  };

  return (
    <div >
      <h2 >Create New Thread</h2>
      <form onSubmit={handleSubmit} >
        <div>
          <label >Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label >Content</label>
          <textarea
            
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label >Thread Type</label>
          <select
            value={threadType}
            onChange={(e) => setThreadType(e.target.value)}
          >
            <option value="ADOPTION">Looking to Adopt</option>
            <option value="SURRENDER">Giving Up for Adoption</option>
          </select>
        </div>
        <div>
          <label>Pet ID</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={petId}
            onChange={(e) => setPetId(e.target.value)}
            placeholder="Enter pet ID"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Thread'}
        </button>
        {error && <p >Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default CreateThreadForm;
