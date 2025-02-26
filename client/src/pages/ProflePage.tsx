import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { jwtDecode } from 'jwt-decode';
import { Plus, Trash, Edit, X, Camera } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// GraphQL queries and mutations
const GET_USER_PROFILE = gql`
    query GetUserProfile {
        me {
        _id
        username
        email
        savedPets {
            _id
            name
            breed
            age
            images
        }
        userPets {
            _id
            name
            species
            breed
            age
            description
            image
        }
        }
    }
`;

const UPDATE_PROFILE = gql`
    mutation UpdateProfile($input: UpdateProfileInput!) {
        updateProfile(input: $input) {
        _id
        username
        email
        }
    }
`;

const ADD_USER_PET = gql`
    mutation AddUserPet($input: UserPetInput!) {
        addUserPet(input: $input) {
        _id
        name
        species
        breed
        age
        description
        image
        }
    }
`;

const REMOVE_USER_PET = gql`
    mutation RemoveUserPet($petId: ID!) {
        removeUserPet(petId: $petId)
    }
`;

// TypeScript interfaces
interface UserPet {
    _id?: string;
    name: string;
    species: string;
    breed: string;
    age: number;
    description: string;
    image?: string;
}

interface SavedPet {
    _id: string;
    name: string;
    breed?: string;
    age?: number;
    images?: string[];
}

interface UserProfile {
    _id: string;
    username: string;
    email: string;
    savedPets: SavedPet[];
    userPets: UserPet[];
}

interface TokenData {
    data: {
        _id: string;
        username: string;
        email: string;
    };
}

const ProfilePage = () => {
    const { isLoggedIn, getToken } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'pets' | 'saved'>('profile');
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingPet, setIsAddingPet] = useState(false);
    const [editableProfile, setEditableProfile] = useState({
        username: '',
        email: '',
    });
    const [newPet, setNewPet] = useState<UserPet>({
        name: '',
        species: 'Dog',
        breed: '',
        age: 0,
        description: '',
    });
    const [message, setMessage] = useState({ text: '', type: '' });

    // Get user ID from token
    const getUserIdFromToken = () => {
        const token = getToken();
        if (!token) return null;

        try {
            const decoded = jwtDecode<TokenData>(token);
            return decoded.data._id;
        } catch (err) {
            return null;
        }
    };

    const userId = getUserIdFromToken();

    // GraphQL hooks
    const { loading, error, data, refetch } = useQuery(GET_USER_PROFILE, {
        skip: !isLoggedIn || !userId,
        onCompleted: (data) => {
            if (data?.me) {
                setEditableProfile({
                    username: data.me.username,
                    email: data.me.email,
                });
            }
        },
        fetchPolicy: 'network-only',
    });

    const [updateProfile, { loading: updateLoading }] = useMutation(UPDATE_PROFILE, {
        onCompleted: () => {
            setIsEditing(false);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            refetch();
        },
        onError: (error) => {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        },
    });

    const [addUserPet, { loading: addPetLoading }] = useMutation(ADD_USER_PET, {
        onCompleted: () => {
            setIsAddingPet(false);
            setNewPet({
                name: '',
                species: 'Dog',
                breed: '',
                age: 0,
                description: '',
            });
            setMessage({ text: 'Pet added successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            refetch();
        },
        onError: (error) => {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        },
    });

    const [removeUserPet] = useMutation(REMOVE_USER_PET, {
        onCompleted: () => {
            setMessage({ text: 'Pet removed successfully!', type: 'success' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            refetch();
        },
        onError: (error) => {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        },
    });

    // Redirect if not logged in
    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login');
        }
    }, [isLoggedIn, navigate]);

    // Handle form submission for profile update
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile({
            variables: {
                input: {
                    username: editableProfile.username,
                    email: editableProfile.email,
                },
            },
        });
    };

    // Handle form submission for adding a pet
    const handleAddPet = (e: React.FormEvent) => {
        e.preventDefault();
        addUserPet({
            variables: {
                input: newPet,
            },
        });
    };

    // Handle removing a pet
    const handleRemovePet = (petId: string) => {
        if (window.confirm('Are you sure you want to remove this pet?')) {
            removeUserPet({
                variables: {
                    petId,
                },
            });
        }
    };

    // Cancel editing/adding
    const handleCancel = () => {
        if (isEditing) {
            setIsEditing(false);
            // Reset to original values
            if (data?.me) {
                setEditableProfile({
                    username: data.me.username,
                    email: data.me.email,
                });
            }
        }
        if (isAddingPet) {
            setIsAddingPet(false);
            setNewPet({
                name: '',
                species: 'Dog',
                breed: '',
                age: 0,
                description: '',
            });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 max-w-lg w-full">
                    <h2 className="text-red-700 font-semibold mb-2">Error</h2>
                    <p className="text-red-600">{error.message}</p>
                </div>
                <button
                    onClick={() => refetch()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Try Again
                </button>
            </div>
        );
    }

    const profile: UserProfile | null = data?.me || null;

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Header */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {profile?.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">{profile?.username}</h1>
                            <p className="text-gray-600">{profile?.email}</p>
                        </div>
                    </div>
                </div>

                {/* Message Banner */}
                {message.text && (
                    <div
                        className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                            }`}
                    >
                        {message.text}
                    </div>
                )}

                {/* Tab Navigation */}
                <div className="flex border-b border-gray-200 mb-8">
                    <button
                        className={`py-4 px-6 font-medium ${activeTab === 'profile'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Profile Information
                    </button>
                    <button
                        className={`py-4 px-6 font-medium ${activeTab === 'pets'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('pets')}
                    >
                        My Pets
                    </button>
                    <button
                        className={`py-4 px-6 font-medium ${activeTab === 'saved'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                        onClick={() => setActiveTab('saved')}
                    >
                        Saved Pets
                    </button>
                </div>

                {/* Profile Information Tab */}
                {activeTab === 'profile' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">Profile Information</h2>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <Edit className="w-4 h-4 mr-1" />
                                    Edit
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleUpdateProfile}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Username
                                        </label>
                                        <input
                                            type="text"
                                            value={editableProfile.username}
                                            onChange={(e) =>
                                                setEditableProfile({ ...editableProfile, username: e.target.value })
                                            }
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            value={editableProfile.email}
                                            onChange={(e) =>
                                                setEditableProfile({ ...editableProfile, email: e.target.value })
                                            }
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div className="pt-4">
                                        <button
                                            type="submit"
                                            disabled={updateLoading}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                        >
                                            {updateLoading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Username</h3>
                                    <p>{profile?.username}</p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                                    <p>{profile?.email}</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* My Pets Tab */}
                {activeTab === 'pets' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold">My Pets</h2>
                            {!isAddingPet ? (
                                <button
                                    onClick={() => setIsAddingPet(true)}
                                    className="flex items-center text-blue-600 hover:text-blue-800"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Pet
                                </button>
                            ) : (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center text-red-600 hover:text-red-800"
                                    >
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </button>
                                </div>
                            )}
                        </div>

                        {isAddingPet ? (
                            <form onSubmit={handleAddPet} className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pet Name
                                        </label>
                                        <input
                                            type="text"
                                            value={newPet.name}
                                            onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Species
                                        </label>
                                        <select
                                            value={newPet.species}
                                            onChange={(e) => setNewPet({ ...newPet, species: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            required
                                        >
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
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Breed
                                        </label>
                                        <input
                                            type="text"
                                            value={newPet.breed}
                                            onChange={(e) => setNewPet({ ...newPet, breed: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Age
                                        </label>
                                        <input
                                            type="number"
                                            value={newPet.age}
                                            onChange={(e) => setNewPet({ ...newPet, age: parseInt(e.target.value) || 0 })}
                                            className="w-full p-2 border rounded-md"
                                            min="0"
                                            required
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            value={newPet.description}
                                            onChange={(e) => setNewPet({ ...newPet, description: e.target.value })}
                                            className="w-full p-2 border rounded-md"
                                            rows={3}
                                        ></textarea>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Photo
                                        </label>
                                        <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center">
                                            <div className="space-y-1 text-center">
                                                <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input id="file-upload" name="file-upload" type="file" className="sr-only" />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        type="submit"
                                        disabled={addPetLoading}
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                    >
                                        {addPetLoading ? 'Adding Pet...' : 'Add Pet'}
                                    </button>
                                </div>
                            </form>
                        ) : null}

                        {/* Pet list */}
                        <div className="space-y-4">
                            {profile && profile.userPets && profile.userPets.length > 0 ? (
                                profile.userPets.map((pet) => (
                                    <div
                                        key={pet._id}
                                        className="flex items-start p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="h-16 w-16 rounded-md bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                                            {pet.image ? (
                                                <img src={pet.image} alt={pet.name} className="h-full w-full object-cover rounded-md" />
                                            ) : (
                                                <span className="text-lg">{pet.species.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium">{pet.name}</h3>
                                            <p className="text-sm text-gray-500">
                                                {pet.species} • {pet.breed} • {pet.age} years old
                                            </p>
                                            <p className="text-sm mt-1">{pet.description}</p>
                                        </div>
                                        <button
                                            onClick={() => pet._id && handleRemovePet(pet._id)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8">
                                    <p className="text-gray-500">You haven't added any pets yet.</p>
                                    <button
                                        onClick={() => setIsAddingPet(true)}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Add your first pet
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Saved Pets Tab */}
                {activeTab === 'saved' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-bold mb-6">Saved Pets</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {profile && profile.userPets && profile.userPets.length > 0 ? (
                            profile.userPets.map((pet) => (
                                    <div
                                        key={pet._id}
                                        className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                    >
                                        <div className="h-48 bg-gray-200">
                                            {pet.image ? (
                                                <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="h-full flex items-center justify-center bg-blue-100 text-blue-600">
                                                    <span className="text-2xl">No Image</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4">
                                            <h3 className="font-bold">{pet.name}</h3>
                                            <p className="text-sm text-gray-600">
                                                {pet.breed} • {pet.age ? `${pet.age} years old` : 'Age unknown'}
                                            </p>
                                            <button
                                                className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                                                onClick={() => navigate(`/pets/${pet._id}`)}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-8">
                                    <p className="text-gray-500">You haven't saved any pets yet.</p>
                                    <button
                                        onClick={() => navigate('/findpets')}
                                        className="mt-2 text-blue-600 hover:text-blue-800"
                                    >
                                        Find pets to save
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;