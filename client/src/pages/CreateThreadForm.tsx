import React, { useState, ChangeEvent } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const CREATE_THREAD = gql`
  mutation CreateThread($input: CreateThreadInput!) {
    createThread(input: $input) {
      id
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
  const [threadType, setThreadType] = useState('ADOPTION');
  
  // Pet information state
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState<number>(0);
  const [petDescription, setPetDescription] = useState('');
  const [petImage, setPetImage] = useState(''); // Will hold the base64 string

  const [createThread, { loading, error }] = useMutation(CREATE_THREAD, {
    onCompleted: () => navigate('/forum'),
  });

  // Convert selected file to base64 string
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPetImage(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createThread({
        variables: {
          input: {
            title,
            content,
            threadType,
            pet: {
              name: petName,
              species: petSpecies,
              breed: petBreed,
              age: petAge,
              description: petDescription,
              image: petImage, // This is the base64 string; the resolver will handle the upload
            },
          },
        },
      });
    } catch (err) {
      console.error('Error creating thread:', err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Create New Thread</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thread information */}
        <div>
          <label className="block mb-1 font-semibold">Title</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Content</label>
          <textarea
            className="w-full border p-2 rounded"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Thread Type</label>
          <select
            className="w-full border p-2 rounded"
            value={threadType}
            onChange={(e) => setThreadType(e.target.value)}
          >
            <option value="ADOPTION">Looking to Adopt</option>
            <option value="SURRENDER">Giving Up for Adoption</option>
          </select>
        </div>

        {/* Pet information */}
        <h3 className="text-xl font-bold mt-4">Pet Information</h3>
        <div>
          <label className="block mb-1 font-semibold">Pet Name</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={petName}
            onChange={(e) => setPetName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Species</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={petSpecies}
            onChange={(e) => setPetSpecies(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Breed</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={petBreed}
            onChange={(e) => setPetBreed(e.target.value)}
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Age</label>
          <input
            type="number"
            className="w-full border p-2 rounded"
            value={petAge}
            onChange={(e) => setPetAge(Number(e.target.value))}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-semibold">Description</label>
          <textarea
            className="w-full border p-2 rounded"
            value={petDescription}
            onChange={(e) => setPetDescription(e.target.value)}
          ></textarea>
        </div>
        <div>
          <label className="block mb-1 font-semibold">Pet Image</label>
          <input type="file" onChange={handleFileChange} accept="image/*" />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Thread'}
        </button>
        {error && <p className="text-red-500">Error: {error.message}</p>}
      </form>
    </div>
  );
};

export default CreateThreadForm;
