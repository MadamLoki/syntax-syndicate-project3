import React, { useState, ChangeEvent } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

// Define the mutation for creating a thread
const CREATE_THREAD = gql`
  mutation CreateThread($input: CreateThreadInput!) {
    createThread(input: $input) {
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
      }
    }
  }
`;

// Define the query for fetching threads (for refetching)
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

const CreateThreadForm = () => {
  // Set up navigation hook for redirecting after submission
  const navigate = useNavigate();
  
  // State for form fields
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [threadType, setThreadType] = useState('ADOPTION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Pet information state
  const [petName, setPetName] = useState('');
  const [petSpecies, setPetSpecies] = useState('');
  const [petBreed, setPetBreed] = useState('');
  const [petAge, setPetAge] = useState(0);
  const [petDescription, setPetDescription] = useState('');
  const [petImage, setPetImage] = useState('');

  // Set up the mutation with callbacks
  const [createThread, { loading }] = useMutation(CREATE_THREAD, {
    // Refetch the threads query to ensure the data is fresh
    refetchQueries: [{ query: GET_THREADS }],
    
    // Handle successful thread creation
    onCompleted: (data) => {
      setIsSubmitting(false);
      
      // Show success message (optional)
      alert('Thread created successfully!');
      
      // Navigate back to the forum page to see the new thread
      navigate('/forum');
    },
    
    // Handle errors
    onError: (error) => {
      console.error('Error creating thread:', error);
      setErrorMessage(`Failed to create thread: ${error.message}`);
      setIsSubmitting(false);
    }
  });

  // Handle file uploads for pet images
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

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form fields
    if (!title.trim() || !content.trim() || !petName.trim() || !petSpecies) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setErrorMessage('');
      
      // Call the mutation with form data
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
              image: petImage,
              // Note: We don't need to set the owner as the backend will handle this
            },
          },
        },
      });
      
      // Note: We don't need to navigate here as it's handled in onCompleted
    } catch (err) {
      // This catch block handles any errors not caught by onError
      console.error('Unexpected error creating thread:', err);
      setErrorMessage('An unexpected error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Create New Thread</h2>
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{errorMessage}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thread information section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Thread Information</h3>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="title">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="content">
              Content <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="threadType">
              Thread Type
            </label>
            <select
              id="threadType"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={threadType}
              onChange={(e) => setThreadType(e.target.value)}
              disabled={isSubmitting}
            >
              <option value="ADOPTION">Looking to Adopt</option>
              <option value="SURRENDER">Giving Up for Adoption</option>
            </select>
          </div>
        </div>

        {/* Pet information section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Pet Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="petName">
                Pet Name <span className="text-red-500">*</span>
              </label>
              <input
                id="petName"
                type="text"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="petSpecies">
                Species <span className="text-red-500">*</span>
              </label>
              <select
                id="petSpecies"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={petSpecies}
                onChange={(e) => setPetSpecies(e.target.value)}
                required
                disabled={isSubmitting}
              >
                <option value="">Select species</option>
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Fish">Fish</option>
                <option value="Small Animal">Small Animal</option>
                <option value="Reptile">Reptile</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="petBreed">
                Breed
              </label>
              <input
                id="petBreed"
                type="text"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={petBreed}
                onChange={(e) => setPetBreed(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2" htmlFor="petAge">
                Age <span className="text-red-500">*</span>
              </label>
              <input
                id="petAge"
                type="number"
                min="0"
                max="100"
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={petAge}
                onChange={(e) => setPetAge(Number(e.target.value))}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="petDescription">
              Description
            </label>
            <textarea
              id="petDescription"
              className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={petDescription}
              onChange={(e) => setPetDescription(e.target.value)}
              disabled={isSubmitting}
            ></textarea>
          </div>
          
          <div className="mt-4">
            <label className="block text-gray-700 font-medium mb-2" htmlFor="petImage">
              Pet Image
            </label>
            <input
              id="petImage"
              type="file"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full border border-gray-300 p-2 rounded"
              disabled={isSubmitting}
            />
            {petImage && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">Image preview:</p>
                <img src={petImage} alt="Preview" className="mt-1 h-32 object-cover rounded" />
              </div>
            )}
          </div>
        </div>
        
        {/* Form actions */}
        <div className="flex justify-between">
          <button
            type="button"
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => navigate('/forum')}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 flex items-center"
            disabled={loading || isSubmitting}
          >
            {(loading || isSubmitting) ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : 'Create Thread'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateThreadForm;