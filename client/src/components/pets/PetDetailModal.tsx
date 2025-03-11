import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, X, MapPin, Calendar, Tag, Mail, Phone } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { useAuth } from '../auth/AuthContext';
import { SAVE_PET } from '../../utils/mutations';

interface PetfinderAddress {
    address1?: string;
    address2?: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
}

interface PetfinderContact {
    email: string;
    phone: string;
    address: PetfinderAddress;
}

interface PetfinderBreed {
    primary: string;
    secondary?: string;
    mixed: boolean;
}

interface PetfinderPhoto {
    small: string;
    medium: string;
    large: string;
    full: string;
}

interface PetfinderAttributes {
    spayed_neutered: boolean;
    house_trained: boolean;
    declawed?: boolean;
    special_needs: boolean;
    shots_current: boolean;
}

interface PetDetailProps {
    pet: {
        id: string;
        name: string;
        type: string;
        breeds: PetfinderBreed;
        age: string;
        gender: string;
        size: string;
        description?: string;
        photos: PetfinderPhoto[];
        status: string;
        attributes?: PetfinderAttributes;
        contact: PetfinderContact;
        published_at?: string;
        distance?: number;
        organization_id?: string;
    };
    onClose: () => void;
}

const PetDetailModal: React.FC<PetDetailProps> = ({ pet, onClose }) => {
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [savePet, { loading }] = useMutation(SAVE_PET, {
        onCompleted: () => {
            setIsSaved(true);
            setSaveError(null);
        },
        onError: (error) => {
            console.error('Error saving pet:', error);
            setSaveError(error.message);
        }
    });
    const handleSavePet = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        if (!isLoggedIn) {
            alert('Please log in to save pets');
            return;
        }

        try {
            // Pre-process images to get just the URLs
            const images: string[] = pet.photos && pet.photos.length > 0
                ? pet.photos.map(photo => photo.medium || photo.small || photo.large).filter(Boolean as any)
                : [];

            // Create compatible input object without secondaryBreed
            const petInput = {
                externalId: pet.id,
                name: pet.name,
                type: pet.type,
                breed: pet.breeds.primary + (pet.breeds.secondary ? ` / ${pet.breeds.secondary}` : ""),
                age: pet.age,
                gender: pet.gender,
                size: pet.size,
                status: pet.status || "Available",
                images: images,
                description: pet.description || "",
                shelterId: pet.organization_id || "petfinder"
            };

            // Call the mutation
            await savePet({
                variables: { input: petInput }
            });

            setIsSaved(true);
            setSaveError(null);
        } catch (err) {
            console.error('Error in handler for saving pet:', err);
            let errorMessage = 'Failed to save pet. Please try again.';
            if (err instanceof Error) {
                errorMessage = err.message;
            }
            setSaveError(errorMessage);
        }
    };

    const handleViewFullDetails = () => {
        // Store pet data in localStorage before navigating
        try {
            // Pre-process pet data for easier retrieval
            const petData = {
                id: pet.id,
                name: pet.name,
                type: pet.type,
                breed: pet.breeds.primary,
                secondaryBreed: pet.breeds.secondary,
                age: pet.age,
                gender: pet.gender,
                size: pet.size,
                description: pet.description || '',
                images: pet.photos?.map(photo => photo.large || photo.medium || photo.small).filter(Boolean),
                status: pet.status,
                contact: pet.contact,
                attributes: pet.attributes,
                published_at: pet.published_at
            };

            // Store for temporary access
            localStorage.setItem('tempPetDetails', JSON.stringify(petData));

            console.log('Navigating to pet details with ID:', pet.id);
            onClose();

            // Navigate to the pet details page with the proper ID
            navigate(`/pets/${pet.id}`);
        } catch (error) {
            console.error('Error preparing data for navigation:', error);
            // Fallback to basic navigation if data prep fails
            onClose();
            navigate(`/pets/${pet.id}`);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const renderAttributes = () => {
        if (!pet.attributes) return null;

        return (
            <div className="grid grid-cols-2 gap-2 mt-4">
                <div className={`py-1 px-2 rounded-full text-sm text-center ${pet.attributes.spayed_neutered ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pet.attributes.spayed_neutered ? 'Spayed/Neutered' : 'Not Spayed/Neutered'}
                </div>
                <div className={`py-1 px-2 rounded-full text-sm text-center ${pet.attributes.house_trained ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pet.attributes.house_trained ? 'House Trained' : 'Not House Trained'}
                </div>
                <div className={`py-1 px-2 rounded-full text-sm text-center ${pet.attributes.shots_current ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {pet.attributes.shots_current ? 'Shots Current' : 'Shots Not Current'}
                </div>
                {pet.attributes.special_needs && (
                    <div className="py-1 px-2 rounded-full text-sm text-center bg-yellow-100 text-yellow-800">
                        Special Needs
                    </div>
                )}
                {pet.type === 'Cat' && (
                    <div className={`py-1 px-2 rounded-full text-sm text-center ${pet.attributes.declawed ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                        {pet.attributes.declawed ? 'Declawed' : 'Not Declawed'}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white z-10 border-b flex justify-between items-center p-4">
                    <h2 className="text-2xl font-bold">{pet.name}</h2>
                    <div className="flex items-center space-x-2">
                        {isLoggedIn && (
                            <button
                                onClick={handleSavePet}
                                disabled={loading || isSaved}
                                className={`${isSaved ? 'text-pink-600' : 'text-pink-500 hover:text-pink-700'}`}
                                aria-label="Save pet"
                            >
                                <Heart className="w-6 h-6" fill={isSaved ? "currentColor" : "none"} />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                            aria-label="Close"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Photos */}
                        <div>
                            {pet.photos && pet.photos.length > 0 ? (
                                <div className="rounded-lg overflow-hidden">
                                    <img
                                        src={pet.photos[0].large || pet.photos[0].medium}
                                        alt={pet.name}
                                        className="w-full h-72 object-cover"
                                    />
                                    {pet.photos.length > 1 && (
                                        <div className="grid grid-cols-4 gap-2 mt-2">
                                            {pet.photos.slice(1, 5).map((photo, index) => (
                                                <img
                                                    key={index}
                                                    src={photo.small}
                                                    alt={`${pet.name} ${index + 2}`}
                                                    className="w-full h-20 object-cover rounded"
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="bg-gray-200 rounded-lg h-72 flex items-center justify-center">
                                    <p className="text-gray-500">No photos available</p>
                                </div>
                            )}
                        </div>

                        {/* Details */}
                        <div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm flex items-center">
                                    <Tag className="w-3 h-3 mr-1" /> {pet.type}
                                </span>
                                <span className="bg-purple-100 text-purple-800 py-1 px-3 rounded-full text-sm">
                                    {pet.breeds.primary}
                                    {pet.breeds.secondary && ` / ${pet.breeds.secondary}`}
                                </span>
                                <span className="bg-green-100 text-green-800 py-1 px-3 rounded-full text-sm">
                                    {pet.age}
                                </span>
                                <span className="bg-yellow-100 text-yellow-800 py-1 px-3 rounded-full text-sm">
                                    {pet.gender}
                                </span>
                                <span className="bg-red-100 text-red-800 py-1 px-3 rounded-full text-sm">
                                    {pet.size}
                                </span>
                                <span className="bg-indigo-100 text-indigo-800 py-1 px-3 rounded-full text-sm flex items-center">
                                    <Calendar className="w-3 h-3 mr-1" /> {formatDate(pet.published_at)}
                                </span>
                                {pet.distance && (
                                    <span className="bg-teal-100 text-teal-800 py-1 px-3 rounded-full text-sm flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" /> {Math.round(pet.distance)} miles
                                    </span>
                                )}
                            </div>

                            {renderAttributes()}

                            {/* Description Preview - Show just the first 150 characters */}
                            {pet.description && (
                                <div className="mt-4">
                                    <h3 className="text-lg font-semibold mb-2">About {pet.name}</h3>
                                    <p className="text-gray-700">
                                        {pet.description.length > 150
                                            ? `${pet.description.substring(0, 150)}...`
                                            : pet.description}
                                    </p>
                                    {pet.description.length > 150 && (
                                        <span className="text-blue-600 text-sm cursor-pointer hover:underline" onClick={handleViewFullDetails}>
                                            Read more
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Contact Preview */}
                            <div className="mt-4 bg-blue-50 p-3 rounded-lg">
                                <h3 className="text-md font-semibold mb-2">Contact Information</h3>
                                <p className="text-gray-700 flex items-center mb-1">
                                    <MapPin className="w-4 h-4 mr-1 text-blue-500" />
                                    {pet.contact.address.city}, {pet.contact.address.state}
                                </p>
                                {pet.contact.email && (
                                    <p className="text-gray-700 flex items-center">
                                        <Mail className="w-4 h-4 mr-1 text-blue-500" />
                                        {pet.contact.email.length > 25
                                            ? `${pet.contact.email.substring(0, 25)}...`
                                            : pet.contact.email}
                                    </p>
                                )}
                            </div>

                            {/* Error Message */}
                            {saveError && (
                                <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
                                    Error: {saveError}
                                </div>
                            )}

                            {/* Success Message */}
                            {isSaved && (
                                <div className="mt-4 bg-green-100 text-green-700 p-3 rounded-lg">
                                    {pet.name} has been saved to your favorites!
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="mt-6 grid grid-cols-2 gap-3">
                                <button
                                    className={`border border-pink-500 text-pink-500 py-2 px-4 rounded-lg hover:bg-pink-50 transition-colors flex items-center justify-center ${isSaved ? 'bg-pink-50' : ''}`}
                                    onClick={handleSavePet}
                                    disabled={loading || isSaved}
                                >
                                    <Heart className="w-4 h-4 mr-2" fill={isSaved ? "currentColor" : "none"} />
                                    {loading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                                </button>
                                <button
                                    className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                                    onClick={handleViewFullDetails}
                                >
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetailModal;