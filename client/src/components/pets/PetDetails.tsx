import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, gql } from '@apollo/client';
import {ArrowLeft, Heart, Share, MapPin, Mail, Phone, Calendar, Check, X, ExternalLink, User } from 'lucide-react';
import { ErrorMessage } from '../ErrorMessage';
import { useAuth } from '../auth/AuthContext';
import { SAVE_PET } from '../../utils/mutations';
import { useMutation } from '@apollo/client';

// GraphQL query to get pet details by ID
const GET_PET_DETAILS = gql`
query GetPetDetails($id: ID!) {
    pet(id: $id) {
        _id
        externalId
        name
        type
        breed
        age
        gender
        size
        status
        description
        images
        shelterId
        source
    shelterInfo {
        name
        address
        city
        state
        zipCode
        country
        email
        phone
        website
    }
    attributes {
        spayedNeutered
        houseTrained
        declawed
        specialNeeds
        shotsCurrent
    }
    environment {
        children
        dogs
        cats
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

    // Query to fetch pet details
    const { loading, error, data } = useQuery(GET_PET_DETAILS, {
        variables: { id },
        skip: !id,
        fetchPolicy: 'network-only'
    });

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

        const pet = data?.pet;
        if (!pet) return;

        // Create the input object for the mutation
        const petInput = {
            externalId: pet.externalId || pet._id,
            name: pet.name,
            type: pet.type || "Unknown",
            breed: pet.breed || "",
            age: pet.age || "",
            gender: pet.gender || "",
            size: pet.size || "",
            status: pet.status || "Available",
            images: pet.images || [],
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
                title: `Adopt ${data?.pet.name}`,
                text: `Check out ${data?.pet.name}, a ${data?.pet.breed} available for adoption!`,
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

    // If we're loading, show a loading indicator
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If there's an error, show an error message
    if (error) {
        return (
            <div className="container mx-auto p-4 max-w-5xl">
                <ErrorMessage error={error} className="my-8" />
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                </button>
            </div>
        );
    }

    // If pet not found, show a message
    if (!data || !data.pet) {
        return (
            <div className="container mx-auto p-4 max-w-5xl">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-8">
                    <h2 className="text-yellow-800 font-semibold mb-2">Pet Not Found</h2>
                    <p className="text-yellow-700">
                        The pet you're looking for doesn't exist or may have been adopted already.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/findpets')}
                    className="flex items-center text-blue-600 hover:text-blue-800"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Search
                </button>
            </div>
        );
    }

    const pet = data.pet;
    const hasMultipleImages = pet.images && pet.images.length > 1;

    // Format location string
    const getLocationString = () => {
        if (pet.shelterInfo) {
            const { city, state, zipCode } = pet.shelterInfo;
            return [city, state, zipCode].filter(Boolean).join(', ');
        }
        return 'Location not specified';
    };

    // Format attributes for display
    const getAttributeStatus = (value: boolean | null | undefined) => {
        if (value === null || value === undefined) return 'Unknown';
        return value ? 'Yes' : 'No';
    };

    // Generate Google Maps URL
    const getMapUrl = () => {
        const { shelterInfo } = pet;
        if (!shelterInfo) return '';

        const address = [
            shelterInfo.address,
            shelterInfo.city,
            shelterInfo.state,
            shelterInfo.zipCode,
            shelterInfo.country
        ].filter(Boolean).join(', ');

        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    };

    return (
        <div className="bg-gray-50 min-h-screen py-8">
            <div className="container mx-auto px-4 max-w-6xl">
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
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-gray-800">
                                        Pet Details
                                    </h3>
                                    <ul className="space-y-2">
                                        {pet.attributes && (
                                            <>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Spayed/Neutered:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.spayedNeutered ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.spayedNeutered)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">House Trained:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.houseTrained ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.houseTrained)}
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
                                                        {pet.attributes.specialNeeds ? (
                                                            <Check className="w-4 h-4 text-yellow-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-green-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.specialNeeds)}
                                                    </span>
                                                </li>
                                                <li className="flex justify-between py-2 border-b border-gray-100">
                                                    <span className="text-gray-600">Shots Current:</span>
                                                    <span className="font-medium flex items-center">
                                                        {pet.attributes.shotsCurrent ? (
                                                            <Check className="w-4 h-4 text-green-600 mr-1" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600 mr-1" />
                                                        )}
                                                        {getAttributeStatus(pet.attributes.shotsCurrent)}
                                                    </span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </div>

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

                            {pet.shelterInfo && (
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-gray-500 text-sm">Organization</h3>
                                        <p className="font-medium">{pet.shelterInfo.name || 'Unknown Organization'}</p>
                                    </div>

                                    <div>
                                        <h3 className="text-gray-500 text-sm">Location</h3>
                                        <p className="font-medium">{getLocationString()}</p>
                                    </div>

                                    {/* Status badge */}
                                    <div className="flex items-center">
                                        <div className={`h-2.5 w-2.5 rounded-full mr-2 ${pet.status === 'Available' ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></div>
                                        <span className="font-medium">
                                            {pet.status === 'Available' ? 'Available for Adoption' : pet.status}
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
                                    {showContact && (
                                        <div className="mt-4 space-y-4 bg-blue-50 p-4 rounded-lg">
                                            {pet.shelterInfo.email && (
                                                <div className="flex items-start">
                                                    <Mail className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Email</h4>
                                                        <a
                                                            href={`mailto:${pet.shelterInfo.email}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {pet.shelterInfo.email}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {pet.shelterInfo.phone && (
                                                <div className="flex items-start">
                                                    <Phone className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Phone</h4>
                                                        <a
                                                            href={`tel:${pet.shelterInfo.phone}`}
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            {pet.shelterInfo.phone}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}

                                            {pet.shelterInfo.address && (
                                                <div className="flex items-start">
                                                    <MapPin className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Address</h4>
                                                        <p>
                                                            {pet.shelterInfo.address} <br />
                                                            {[
                                                                pet.shelterInfo.city,
                                                                pet.shelterInfo.state,
                                                                pet.shelterInfo.zipCode
                                                            ].filter(Boolean).join(', ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {pet.shelterInfo.website && (
                                                <div className="flex items-start">
                                                    <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                                                    <div>
                                                        <h4 className="text-sm font-medium">Website</h4>
                                                        <a
                                                            href={pet.shelterInfo.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline"
                                                        >
                                                            Visit Website
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Map if we have shelter location */}
                                    {pet.shelterInfo && pet.shelterInfo.address && (
                                        <div className={`mt-6 ${isMapExpanded ? 'h-96' : 'h-48'} transition-all duration-300`}>
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-gray-700 font-medium">Location Map</h3>
                                                <button
                                                    onClick={() => setIsMapExpanded(!isMapExpanded)}
                                                    className="text-blue-600 text-sm hover:underline"
                                                >
                                                    {isMapExpanded ? 'Collapse Map' : 'Expand Map'}
                                                </button>
                                            </div>
                                            <div className="relative w-full h-full rounded-lg overflow-hidden border border-gray-200">
                                                <iframe
                                                    title="Shelter Location"
                                                    width="100%"
                                                    height="100%"
                                                    frameBorder="0"
                                                    src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${encodeURIComponent(
                                                        [
                                                            pet.shelterInfo.address,
                                                            pet.shelterInfo.city,
                                                            pet.shelterInfo.state,
                                                            pet.shelterInfo.zipCode
                                                        ].filter(Boolean).join(', ')
                                                    )}`}
                                                    allowFullScreen
                                                ></iframe>
                                                <a
                                                    href={getMapUrl()}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="absolute right-2 bottom-2 bg-white px-3 py-1.5 rounded-lg shadow-md text-sm font-medium border border-gray-300 hover:bg-gray-50"
                                                >
                                                    View in Google Maps
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* If no shelter info is available */}
                            {!pet.shelterInfo && (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="text-yellow-700">
                                        Detailed contact information is not available for this pet. Please use the adoption inquiry form below to get in touch with the shelter.
                                    </p>
                                </div>
                            )}
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

                {/* Similar pets section */}
                <div className="mt-12">
                    <h2 className="text-2xl font-bold mb-6">You May Also Like</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* This would be populated with similar pets based on type, breed, etc. */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="h-48 bg-gray-200">
                                <img src={DEFAULT_IMAGE} alt="Similar pet" className="h-full w-full object-cover" />
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold">Similar Pet</h3>
                                <p className="text-sm text-gray-500">Breed • Age</p>
                                <button className="mt-2 text-blue-600 hover:underline">View Details</button>
                            </div>
                        </div>
                        {/* More similar pets would be rendered here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetDetails;