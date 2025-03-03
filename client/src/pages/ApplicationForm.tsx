import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';

const CREATE_APPLICATION = gql`
  mutation CreateApplication($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      petId
      message
      status
      createdAt
    }
  }
`;

interface ApplicationFormProps {
  petId: string;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ petId }) => {
  const [message, setMessage] = useState('');
  const [createApplication, { loading, error, data }] = useMutation(CREATE_APPLICATION, {
    onCompleted: () => {
      setMessage('');
      alert('Application submitted successfully!');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createApplication({ variables: { input: { petId, message } } });
    } catch (err) {
      console.error('Error submitting application:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
      <h2 className="text-2xl mb-4">Adoption Application</h2>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Why do you want to adopt this pet?"
        required
        className="border p-2 mb-4 w-full h-24"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </button>
      {error && <p className="text-red-500 mt-2">Error: {error.message}</p>}
      {data && (
        <p className="text-green-500 mt-2">
          Application submitted! (Status: {data.createApplication.status})
        </p>
      )}
    </form>
  );
};

export default ApplicationForm;

