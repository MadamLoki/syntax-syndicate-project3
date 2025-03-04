import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql, useMutation } from '@apollo/client';
import { ArrowLeft, Heart, Share, MapPin, Mail, Phone, Calendar, Check, X, ExternalLink } from 'lucide-react';
import { ErrorMessage } from '../ErrorMessage';
import { useAuth } from '../auth/AuthContext';
import { SAVE_PET } from '../../utils/mutations';

// GraphQL query for local database pets (MongoDB IDs)
const GET_LOCAL_PET = gql`
  query GetPet($id: ID!) {
    pet(id: $id) {
      _id
      name
      type
      breed
      age
      gender
      size
      description
      images
      status
      shelterId
      source
    }
  }
`;

// GraphQL query for Petfinder pets - Modified to search by ID only
// The problem was in how we were passing the ID to the Petfinder API
const GET_PETFINDER_PET = gql`
  query SearchPetfinderPets($input: PetfinderSearchInput!) {
    searchPetfinderPets(input: $input) {
      animals {
        id
        name
        type
        breeds {
          primary
          secondary
          mixed
        }
        age
        gender
        size
        description
        photos {
          small
          medium
          large
          full
        }
        status
        contact {
          email
          phone
          address {
            address1
            address2
            city
            state
            postcode
            country
          }
        }
        attributes {
          spayed_neutered
          house_trained
          declawed
          special_needs
          shots_current
        }
        environment {
          children
          dogs
          cats
        }
        published_at
      }
    }
  }
`;

// Fallback image if pet has no images
const DEFAULT_IMAGE = "/api/placeholder/600/400";

const PetDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { isLoggedIn } = useAuth();
    const [isSaved, setIsSaved] = useState<boolean>(false);
    const [activeImage, setActiveImage] = useState<number>(0);
    const [showContact, setShowContact] = useState<boolean>(false);
    const [isMapExpanded, setIsMapExpanded] = useState<boolean>(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    
    // Determine if we're dealing with a MongoDB ID or an external ID
    const isMongoId = id?.match(/^[0-9a-fA-F]{24}$/);

    // Local pet query
    const { 
        loading: localLoading, 
        error: localError, 
        data: localData 
    } = useQuery(GET_LOCAL_PET, {
        variables: { id },
        skip: !id || !isMongoId,
        fetchPolicy: 'network-only',
        onError: (error) => {
            console.error('Error fetching local pet:', error);
            setFetchError(`Error fetching local pet: ${error.message}`);
        }
    });

    // Petfinder query with better error handling
    const { 
        loading: externalLoading, 
        error: externalError, 
        data: externalData 
    } = useQuery(GET_PETFINDER_PET, {
        variables: { 
            input: { 
                // When using Petfinder ID, it likely needs a different approach
                // The API probably expects name or other search params instead of ID directly
                name: "",      // Use empty string as fallback
                type: "",      // Use empty string as fallback
                breed: "",     // Use empty string as fallback
                page: 1,       // Start with first page
                limit: 25      // Request reasonable number of results
            } 
        },
        skip: !id || !!isMongoId || id.length === 0,
        fetchPolicy: 'network-only',
        onError: (error) => {
            console.error('Error fetching Petfinder pet:', error);
            setFetchError(`Error fetching Petfinder pet: ${error.message}`);
            
            // Log additional details for debugging
            if (error.networkError) {
                console.error('Network error details:', error.networkError);
            }
            if (error.graphQLErrors) {
                error.graphQLErrors.forEach((gqlError, i) => {
                    console.error(`GraphQL error ${i}:`, gqlError);
                });
            }
        }
    });

    // Normalize and store pet data
    const [pet, setPet] = useState<any>(null);

    // Process and normalize data from either source
    useEffect(() => {
        // Process local data if available
        if (localData?.pet) {
            const localPet = localData.pet;
            setPet({
                _id: localPet._id,
                id: localPet._id,
                name: localPet.name,
                type: localPet.type || 'Unknown',
                breed: localPet.breed || 'Unknown',
                age: localPet.age || 'Unknown',
                gender: localPet.gender || 'Unknown',
                size: localPet.size || 'Unknown',
                description: localPet.description || '',
                images: localPet.images || [],
                status: localPet.status || 'Available',
                shelterId: localPet.shelterId,
                source: localPet.source || 'local',
                // Basic contact info object
                contact: {
                    address: {
                        city: 'Contact for details',
                        state: '',
                    },
                    email: '',
                    phone: ''
                },
                // Default attributes
                attributes: {
                    spayed_neutered: false,
                    house_trained: false,
                    declawed: false,
                    special_needs: false,
                    shots_current: false
                },
                // Default environment
                environment: {
                    children: false,
                    dogs: false,
                    cats: false
                }
            });
        } 
        // Process Petfinder data if available
        else if (externalData?.searchPetfinderPets?.animals?.length > 0) {
            // Find the pet with matching ID if possible
            const matchingPet = externalData.searchPetfinderPets.animals.find(
                (animal: any) => animal.id.toString() === id
            );
            
            // If no exact match, just use the first pet
            const externalPet = matchingPet || externalData.searchPetfinderPets.animals[0];
            
            setPet({
                _id: externalPet.id, // Use external ID
                id: externalPet.id,
                name: externalPet.name,
                type: externalPet.type,
                breed: externalPet.breeds.primary,
                secondaryBreed: externalPet.breeds.secondary,
                age: externalPet.age,
                gender: externalPet.gender,
                size: externalPet.size,
                description: externalPet.description || '',
                // Transform photos array to images array format
                images: externalPet.photos?.map((photo: any) => 
                    photo.large || photo.medium || photo.small
                ).filter(Boolean) || [],
                status: externalPet.status,
                contact: externalPet.contact,
                attributes: externalPet.attributes,
                environment: externalPet.environment,
                published_at: externalPet.published_at,
                source: 'petfinder'
            });
        }
    }, [localData, externalData, id]);

    // Mutation to save a pet to favorites
    const [savePet, { loading: saveLoading }] = useMutation(SAVE_PET, {
        onCompleted: () => {
            setIsSaved(true);
        },
        onError: (error) => {
            console.error('Error saving pet:', error);
        }
    });

    // Handle saving a pet to favorites
    const handleSavePet = () => {
        if (!isLoggedIn) {
            // Prompt user to log in
            if (window.confirm('You need to be logged in to save pets. Would you like to log in now?')) {
                navigate('/login', { state: { from: `/pets/${id}` } });
            }
            return;
        }

        if (!pet) return;

        // Create the input object for the mutation
        const petInput = {
            externalId: pet.id || pet._id,
            name: pet.name,
            type: pet.type || "Unknown",
            breed: pet.breed || "",
            age: pet.age || "",
            gender: pet.gender || "",
            size: pet.size || "",
            status: pet.status || "Available",
            images: Array.isArray(pet.images) ? pet.images : [],
            description: pet.description || "",
            shelterId: pet.shelterId || "unknown"
        };

        // Call the mutation
        savePet({
            variables: { input: petInput }
        });
    };

    // Handle sharing the pet
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: `Adopt ${pet?.name}`,
                text: `Check out ${pet?.name}, a ${pet?.breed} available for adoption!`,
                url: window.location.href
            }).catch(err => {
                console.error('Error sharing:', err);
            });
        } else {
            // Fallback for browsers that don't support the Web Share API
            navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        }
    };

    // Combined loading and error states
    const loading = localLoading || externalLoading;
    const error = localError || externalError || fetchError;

    // If we're loading, show a loading indicator
    if (loading && !pet) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If there's an error and no pet data, show an error message
    if (error && !pet) {
        return (
            <div className="container mx-auto p-4 max-w-5xl">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 my-8">
                    <h2 className="text-red-700 font-semibold mb-2">Error Loading Pet Details</h2>
                    <p className="text-red-600 mb-4">{error instanceof Error ? error.message : String(error)}</p>
                    <p className="text-gray-700 mb-4">
                        There was a problem loading details for this pet. This might be because:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
                        <li>The pet ID is invalid or the pet no longer exists</li>
                        <li>There's a temporary connection issue with the pet database</li>
                        <li>The Petfinder API might be experiencing issues</li>
                    </ul>
                </div>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back to Search
                </button>
            </div>
        );
    }

    // If pet is null but we're not loading anymore, show a not found message
    if (!pet && !loading) {
        return (
            <div className="container mx-auto p-4 max-w-5xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 my-8">
                    <h2 className="text-yellow-700 font-semibold mb-2">Pet Not Found</h2>
                    <p className="text-yellow-600 mb-4">
                        The pet you're looking for might have been adopted or is no longer available.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/findpets')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Search for Pets
                </button>
            </div>
        );
    }

    // If we have a pet object, render its details
    if (pet) {
        const hasMultipleImages = Array.isArray(pet.images) && pet.images.length > 1;

        // Format location string
        const getLocationString = () => {
            if (!pet.contact || !pet.contact.address) return 'Location not specified';
            
            const { city, state, postcode } = pet.contact.address;
            return [city, state, postcode].filter(Boolean).join(', ');
        };

        // Format attributes for display
        const getAttributeStatus = (value: boolean | null | undefined) => {
            if (value === null || value === undefined) return 'Unknown';
            return value ? 'Yes' : 'No';
        };

        return (
            <div className="bg-gray-50 min-h-screen py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Display a warning banner if there were non-blocking errors */}
                    {error && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                            <p className="text-yellow-700">
                                Note: Some information may be incomplete due to connection issues.
                            </p>
                        </div>
                    )}

                    {/* Back button and navigation */}
                    <div className="mb-6 flex justify-between items-center">
                        <button
                            onClick={() => navigate(-1)}
                            className="flex items-center text-gray-600 hover:text-blue-600"
                        >
                            <ArrowLeft className="w-5 h-5 mr-2" />
                            Back
                        </button>

                        <div className="flex items-center space-x-4">
                            <button
                                onClick={handleSavePet}
                                disabled={saveLoading || isSaved}
                                className={`flex items-center px-3 py-1.5 rounded-lg border ${isSaved
                                        ? 'border-pink-500 text-pink-500 bg-pink-50'
                                        : 'border-gray-300 text-gray-700 hover:border-pink-500 hover:text-pink-500'
                                    }`}
                            >
                                <Heart className="w-4 h-4 mr-1.5" fill={isSaved ? "currentColor" : "none"} />
                                {saveLoading ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
                            </button>

                            <button
                                onClick={handleShare}
                                className="flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-500 hover:text-blue-500"
                            >
                                <Share className="w-4 h-4 mr-1.5" />
                                Share
                            </button>
                        </div>
                    </div>

                    {/* Main content grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Left column: Images and basic info */}
                        <div className="lg:col-span-3">
                            {/* Main image */}
                            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="relative w-full h-96">
                                    {/* Display image if available */}
                                    <img
                                        src={pet.images && pet.images.length > 0 ? pet.images[activeImage] : DEFAULT_IMAGE}
                                        alt={pet.name}
                                        className="w-full h-full object-cover object-center"
                                    />

                                    {/* Image navigation buttons */}
                                    {hasMultipleImages && (
                                        <div className="absolute inset-x-0 bottom-0 flex justify-center p-4">
                                            <div className="flex space-x-2 bg-black bg-opacity-50 rounded-full px-3 py-1.5">
                                                {pet.images.map((_: string, index: number) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setActiveImage(index)}
                                                        className={`w-2.5 h-2.5 rounded-full ${index === activeImage ? 'bg-white' : 'bg-gray-400'
                                                            }`}
                                                        aria-label={`View image ${index + 1}`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail images */}
                                {hasMultipleImages && (
                                    <div className="p-2 flex overflow-x-auto space-x-2">
                                        {pet.images.map((image: string, index: number) => (
                                            <button
                                                key={index}
                                                onClick={() => setActiveImage(index)}
                                                className={`h-20 w-20 flex-shrink-0 rounded overflow-hidden ${index === activeImage ? 'ring-2 ring-blue-500' : 'opacity-70'
                                                    }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${pet.name} thumbnail ${index + 1}`}
                                                    className="h-full w-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Pet details */}
                            <div className="mt-6 bg-white rounded-lg shadow-md p-6">
                                <h1 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h1>

                                <div className="flex flex-wrap gap-2 mb-4">
                                    {pet.type && (
                                        <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                                            {pet.type}
                                        </span>
                                    )}
                                    {pet.breed && (
                                        <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                                            {pet.breed}
                                        </span>
                                    )}
                                    {pet.secondaryBreed && (
                                        <span className="bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full">
                                            {pet.secondaryBreed}
                                        </span>
                                    )}
                                    {pet.age && (
                                        <span className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                                            {pet.age}
                                        </span>
                                    )}
                                    {pet.gender && (
                                        <span className="bg-pink-100 text-pink-800 text-sm px-3 py-1 rounded-full">
                                            {pet.gender}
                                        </span>
                                    )}
                                    {pet.size && (
                                        <span className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1 rounded-full">
                                            {pet.size}
                                        </span>
                                    )}
                                    {pet.status && (
                                        <span className="bg-indigo-100 text-indigo-800 text-sm px-3 py-1 rounded-full">
                                            {pet.status}
                                        </span>
                                    )}
                                </div>

                                <div className="flex items-center text-gray-600 mb-6">
                                    <MapPin className="w-5 h-5 mr-2" />
                                    <span>{getLocationString()}</span>
                                </div>

                                {/* Description */}
                                {pet.description && (
                                    <div className="mt-4 mb-6">
                                        <h2 className="text-xl font-semibold mb-2">About {pet.name}</h2>
                                        <p className="text-gray-700 whitespace-pre-line">{pet.description}</p>
                                    </div>
                                )}

                                {/* Pet details grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    {/* Attributes */}
                                    {pet.attributes && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                                Pet Details
                                            </h3>
                                            <ul className="space-y-2">
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Spayed/Neutered:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.spayed_neutered ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.spayed_neutered)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">House Trained:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.house_trained ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.house_trained)}
                                                    </span>
                                                </li>
                                                {pet.type === 'Cat' && (
                                                    <li className="flex justify-between py-2 border-b border-gray-100">
                                                        <span className="text-gray-600">Declawed:</span>
                                                        <span className="font-medium flex items-center">
                                                            {pet.attributes.declawed ? (
                                                                <Check className="w-4 h-4 text-green-600 mr-1" />
                                                            ) : (
                                                                <X className="w-4 h-4 text-red-600 mr-1" />
                                                            )}
                                                            {getAttributeStatus(pet.attributes.declawed)}
                                                        </span>
                                                    </li>
                                                )}
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Special Needs:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.special_needs ? (
                                                            <Check className="w-4 h-4 text-yellow-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-green-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.special_needs)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Shots Current:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.shots_current ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.shots_current)}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}

                                    {/* Good in a home with */}
                                    {pet.environment && (
                                        <div>
                                            <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                                Good In A Home With
                                            </h3>
                                            <ul className="space-y-2">
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Children:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.environment.children ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.environment.children)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Dogs:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.environment.dogs ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.environment.dogs)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Cats:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.environment.cats ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.environment.cats)}
                                                    </span>
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right column: Contact info and map */}
                        <div className="lg:col-span-2">
                            {/* Adoption info */}
                            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                                <h2 className="text-xl font-semibold mb-4">Adoption Info</h2>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-gray-500 text-sm">Organization</h3>
                                        <p className="font-medium">{pet.organization || pet.source === 'petfinder' ? 'Petfinder' : 'Local Shelter'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-gray-500 text-sm">Location</h3>
                                        <p className="font-medium">{getLocationString()}</p>
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center">
                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                            pet.status === 'Available' || pet.status === 'available' 
                                                ? 'bg-green-500' 
                                                : 'bg-yellow-500'
                                        }`}></div>
                                        <span className="font-medium">
                                            {pet.status === 'Available' || pet.status === 'available' 
                                                ? 'Available for Adoption' 
                                                : pet.status}
                                        </span>
                                    </div>

                                    {/* Contact info toggle */}
                                    <button
                                        onClick={() => setShowContact(!showContact)}
                                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                                    >
                                        {showContact ? 'Hide Contact Info' : 'Show Contact Info'}
                                    </button>

                                    {/* Contact information (shown only when toggled) */}
                                    {showContact && pet.contact && (
                                        <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-lg">
                                            {pet.contact.email && (
                                                <div className="flex items-start">
                                                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Email</h4>
                                                        <a
                                                            href={`mailto:${pet.contact.email}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {pet.contact.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {pet.contact.phone && (
                                                <div className="flex items-start">
                                                    <Phone className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Phone</h4>
                                                        <a
                                                            href={`tel:${pet.contact.phone}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {pet.contact.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {pet.contact.address && (
                                                <div className="flex items-start">
                                                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Address</h4>
                                                        <p>
                                                            {pet.contact.address.address1 && (
                                                                <>{pet.contact.address.address1} <br /></>
                                                            )}
                                                            {[
                                                                pet.contact.address.city,
                                                                pet.contact.address.state,
                                                                pet.contact.address.postcode
                                                            ].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Adoption Inquiry Form */}
                            <div className="bg-white rounded-lg shadow-md p-6">
                                <h2 className="text-xl font-semibold mb-4">Adoption Inquiry</h2>
                                <form className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Your Name
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            id="email"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Enter your email"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            className="w-full p-2 border rounded-md"
                                            placeholder="Enter your phone number"
                                        />
                                    </div>

                                    <div>
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                                            Message
                                        </label>
                                        <textarea
                                            id="message"
                                            rows={4}
                                            className="w-full p-2 border rounded-md"
                                            placeholder={`Tell us why you're interested in adopting ${pet.name}`}
                                            required
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Send Inquiry
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Fallback if none of the above conditions are met
    return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="text-center p-8">
                <p className="text-gray-600">Something went wrong. Please try again later.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-4 text-blue-600 hover:text-blue-800"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
};

export default PetDetails;