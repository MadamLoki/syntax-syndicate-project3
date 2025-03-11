import React, { useState, useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Search, Filter, MapPin, Heart } from 'lucide-react';
import {
    SEARCH_PETFINDER_PETS,
    GET_PETFINDER_TYPES,
    GET_PETFINDER_BREEDS
} from '../../utils/petfinderQueries';
import PetDetailModal from './PetDetailModal';
import { useAuth } from '../auth/AuthContext';
import { ErrorMessage } from '../ErrorMessage';

// Pet interfaces remain the same...
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

interface Pet {
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
}

interface PaginationData {
    count_per_page: number;
    total_count: number;
    current_page: number;
    total_pages: number;
}

interface PetfinderResponse {
    animals: Pet[];
    pagination: PaginationData;
}

interface SearchParams {
    name?: string;
    type?: string;
    breed?: string;
    size?: string;
    gender?: string;
    age?: string;
    location?: string;
    distance?: number;
    limit: number;
    page: number;
    sort?: string;
    status?: string;
}

interface Filters {
    type: string;
    breed: string;
    size: string;
    gender: string;
    age: string;
    location: string;
    distance: string;
    page: number;
    limit: number;
}

const PetSearch = () => {
    // Initialize filters from localStorage with zipcode
    const [filters, setFilters] = useState<Filters>(() => {
        const savedFilters = localStorage.getItem('petSearchFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            type: '',
            breed: '',
            size: '',
            gender: '',
            age: '',
            location: '',
            distance: '100',
            page: 1,
            limit: 20 // Default to 20 for better performance
        };
    });

    useEffect(() => {
        localStorage.setItem('petSearchFilters', JSON.stringify(filters));
    }, [filters]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<ApolloError | null>(null);
    const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const [retryCount, setRetryCount] = useState(0);
    const { isLoggedIn } = useAuth();

    interface TypesResponse {
        getPetfinderTypes: string[];
    }

    interface BreedsResponse {
        getPetfinderBreeds: string[];
    }

    // Query for pet types with error handling
    const {
        data: typesData,
        loading: typesLoading,
        error: typesError,
        refetch: refetchTypes
    } = useQuery<TypesResponse>(
        GET_PETFINDER_TYPES,
        {
            fetchPolicy: 'network-only',
            notifyOnNetworkStatusChange: true,
            onError: (error) => {
                console.error('Types query error:', error);
                setError(error);

                // Auto-retry for specific errors
                if (error.networkError ||
                    error.graphQLErrors?.some(e =>
                        e.extensions?.code === 'PETFINDER_AUTH_ERROR' ||
                        e.message.includes('502')
                    )) {
                    setTimeout(() => {
                        console.log('Auto-retrying types query...');
                        refetchTypes();
                    }, 2000);
                }
            }
        }
    );

    const [getBreeds, { data: breedsData, loading: breedsLoading, error: breedsError }] = useLazyQuery<
        BreedsResponse,
        { type: string }
    >(GET_PETFINDER_BREEDS, {
        onError: (error) => {
            console.error('Error fetching breeds:', error);

            // Only set user-facing errors for non-validation issues
            if (!error.graphQLErrors?.some(e => e.extensions?.code === 'INVALID_PARAMETERS')) {
                setError(error);
            }

            // Auto-retry network errors
            if (error.networkError ||
                error.graphQLErrors?.some(e =>
                    e.extensions?.code === 'PETFINDER_AUTH_ERROR' ||
                    e.message.includes('502')
                )) {
                setTimeout(() => {
                    if (filters.type) {
                        getBreeds({ variables: { type: filters.type } });
                    }
                }, 2000);
            }
        },
        fetchPolicy: 'network-only'
    });

    const [searchPets, { data: petsData, loading: petsLoading, error: petsError }] = useLazyQuery<
        { searchPetfinderPets: PetfinderResponse },
        { input: SearchParams }
    >(SEARCH_PETFINDER_PETS, {
        onCompleted: () => {
            setRetryCount(0); // Reset retry count on success
            setIsSearching(false);
        },
        onError: (error) => {
            console.error('Error searching pets:', error);
            setError(error);
            setIsSearching(false);

            // Auto-retry with reduced limit on 502 errors
            if ((error.networkError ||
                error.graphQLErrors?.some(e => e.message.includes('502'))) &&
                retryCount < 2) {

                setRetryCount(retryCount + 1);

                // If error is when using larger limit, auto-fallback to smaller limit
                if (filters.limit > 20) {
                    console.log(`Retrying with reduced limit (${Math.max(20, filters.limit / 2)})`);
                    setTimeout(() => {
                        setFilters(prev => ({
                            ...prev,
                            limit: Math.max(20, Math.floor(prev.limit / 2)) // Reduce limit but not below 20
                        }));
                        // The effect will trigger a new search
                    }, 1000);
                } else {
                    // Otherwise just retry
                    setTimeout(() => {
                        handleSearch();
                    }, 2000);
                }
            }
        },
        fetchPolicy: 'network-only'
    });

    const handleTypeChange = async (type: string) => {
        try {
            setFilters(prev => ({ ...prev, type, breed: '' }));
            if (type) {
                await getBreeds({
                    variables: { type: type.toLowerCase() }
                });
            }
        } catch (err) {
            console.error('Error handling type change:', err);
            setError(err as ApolloError);
        }
    };

    // Effect to trigger search when page or limit changes
    useEffect(() => {
        // Only search if there were previous results or explicit search criteria
        const hasSearchCriteria = filters.type || filters.breed || filters.size ||
            filters.gender || filters.age || filters.location;

        if (petsData || hasSearchCriteria) {
            handleSearch();
        }
    }, [filters.page, filters.limit]);

    // Effect to reset page when substantive filters change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page: 1 // Reset to first page when filters change
        }));
    }, [filters.type, filters.breed, filters.size, filters.gender, filters.age, filters.location, filters.distance]);

    const handleSearch = async () => {
        try {
            // Clear existing error
            setError(null);

            // Validate search parameters
            const validatedParams = validateSearchParams();
            if (!validatedParams) {
                // validateSearchParams will set an error if validation fails
                return;
            }

            setIsSearching(true);
            console.log('Searching with parameters:', validatedParams);

            // Execute the search query
            await searchPets({
                variables: {
                    input: validatedParams
                }
            });
        } catch (err) {
            console.error('Error performing search:', err);
            setError(err as ApolloError);
            setIsSearching(false);
        }
    };

    const validateSearchParams = () => {
        // Clear previous errors
        setError(null);

        // Create a clean search parameters object
        const searchParams: SearchParams = {
            limit: filters.limit || 20,
            page: filters.page || 1
        };

        // Validate and add optional parameters
        if (searchTerm?.trim()) searchParams.name = searchTerm.trim();

        // Add type if selected
        if (filters.type?.trim()) searchParams.type = filters.type.trim();

        // Only add breed if type is selected (prevents "breed without type" errors)
        if (filters.type?.trim() && filters.breed?.trim()) {
            searchParams.breed = filters.breed.trim();
        }

        // Add other filter parameters
        if (filters.size?.trim()) searchParams.size = filters.size.trim();
        if (filters.gender?.trim()) searchParams.gender = filters.gender.trim();
        if (filters.age?.trim()) searchParams.age = filters.age.trim();

        // Validate location if provided
        if (filters.location?.trim()) {
            const location = filters.location.trim();

            // Validate zipcode format if it looks like a zipcode
            if (/^\d+$/.test(location)) {
                if (location.length !== 5) {
                    setError(new ApolloError({ errorMessage: 'Please enter a valid 5-digit zipcode' }));
                    return null;
                }
            }

            searchParams.location = location;

            // Only add distance if we have a valid location
            if (filters.distance) {
                const distance = parseInt(filters.distance);
                if (!isNaN(distance) && distance > 0) {
                    searchParams.distance = distance;
                }
            }
        }

        return searchParams;
    };

    // Improved error UI rendering with suggested solutions
    const renderErrorMessage = (error: ApolloError) => {
        // Extract the most relevant error message for users
        let errorMessage = 'Failed to connect to pet database. Please try again.';
        let errorDetails = '';
        let suggestedAction = '';

        if (error.graphQLErrors?.length) {
            const mainError = error.graphQLErrors[0];
            errorMessage = mainError.message;

            // Add more user-friendly context based on error code or message
            if (mainError.extensions?.code === 'PETFINDER_AUTH_ERROR') {
                errorDetails = 'There was a problem connecting to the pet database.';
                suggestedAction = 'Please try again in a moment.';
            } else if (mainError.message.includes('502') || mainError.message.includes('timeout')) {
                errorDetails = 'The pet database is currently experiencing high traffic or connectivity issues.';
                suggestedAction = 'Try reducing the number of results per page or refining your search criteria.';
            } else if (mainError.extensions?.code === 'PETFINDER_NETWORK_ERROR') {
                errorDetails = 'Please check your internet connection and try again.';
            }
        } else if (error.networkError) {
            errorMessage = 'Network connection issue.';
            errorDetails = 'Unable to reach the pet database at this time.';
            suggestedAction = 'Please check your internet connection and try again in a few moments.';
        }

        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="text-red-700 font-medium mb-2">Error</h3>
                <p className="text-red-600 mb-2">{errorMessage}</p>
                {errorDetails && <p className="text-gray-600 text-sm mb-2">{errorDetails}</p>}
                {suggestedAction && <p className="text-blue-600 text-sm">{suggestedAction}</p>}
            </div>
        );
    };

    // Handle initial search when component loads
    useEffect(() => {
        // Check if we already have search criteria from the filters
        const hasSearchCriteria = filters.type || filters.breed || filters.size ||
            filters.gender || filters.age || filters.location;

        if (hasSearchCriteria) {
            handleSearch();
        }
    }, []);

    if (typesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !petsData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <ErrorMessage error={error} className="max-w-lg w-full mb-4" />
                <button
                    onClick={() => refetchTypes()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    function renderPaginationButtons() {
        const totalPages = petsData?.searchPetfinderPets?.pagination.total_pages || 1;
        const currentPage = filters.page;

        // Calculate page range to show
        let startPage = Math.max(1, currentPage - 2);
        let endPage = Math.min(totalPages, startPage + 4);

        // Adjust start if we're near the end
        if (endPage - startPage < 4) {
            startPage = Math.max(1, endPage - 4);
        }

        const buttons = [];

        for (let i = startPage; i <= endPage; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => setFilters(prev => ({ ...prev, page: i }))}
                    className={`px-4 py-2 border rounded-lg ${currentPage === i ? 'bg-blue-500 text-white' : 'hover:bg-gray-50'}`}
                    aria-label={`Page ${i}`}
                    aria-current={currentPage === i ? 'page' : undefined}
                    disabled={isSearching || petsLoading}
                >
                    {i}
                </button>
            );
        }

        return buttons;
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find Your Next Best Friend</h1>
                <p className="text-gray-600">Search through available pets near you, or around the world.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    <div className="flex-1 relative flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Search pets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                aria-label="Search by pet name"
                            />
                            <Search className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Enter Zipcode"
                                value={filters.location || ''}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    location: e.target.value
                                }))}
                                maxLength={5}
                                className="w-full pl-10 pr-4 py-2 border rounded-lg"
                                aria-label="Search by location"
                            />
                            <MapPin className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <button
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        aria-expanded={isFilterOpen}
                        aria-controls="filter-panel"
                    >
                        <Filter className="w-5 h-5 inline-block mr-2" />
                        Filters
                    </button>
                    <button
                        onClick={handleSearch}
                        disabled={isSearching || petsLoading}
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300 flex items-center justify-center"
                    >
                        {isSearching || petsLoading ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Searching...
                            </>
                        ) : 'Search'}
                    </button>
                </div>

                {/* Error message in search container */}
                {error && (
                    <div className="mb-4">
                        {renderErrorMessage(error)}
                    </div>
                )}

                {isFilterOpen && (
                    <div id="filter-panel" className="border-t pt-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label htmlFor="pet-type" className="block text-sm font-medium text-gray-700 mb-1">
                                    Type
                                </label>
                                <select
                                    id="pet-type"
                                    value={filters.type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full border rounded-lg p-2"
                                    disabled={typesLoading}
                                >
                                    <option value="">Select Type</option>
                                    {typesData?.getPetfinderTypes?.map((type: string) => (
                                        <option key={type} value={type}>
                                            {type}
                                        </option>
                                    ))}
                                </select>
                                {typesLoading && <p className="text-xs text-gray-500 mt-1">Loading types...</p>}
                            </div>

                            <div>
                                <label htmlFor="pet-breed" className="block text-sm font-medium text-gray-700 mb-1">
                                    Breed
                                </label>
                                <select
                                    id="pet-breed"
                                    value={filters.breed}
                                    onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                                    disabled={!filters.type || breedsLoading}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Select Breed</option>
                                    {breedsData?.getPetfinderBreeds?.map((breed: string) => (
                                        <option key={breed} value={breed}>
                                            {breed}
                                        </option>
                                    ))}
                                </select>
                                {breedsLoading && <p className="text-xs text-gray-500 mt-1">Loading breeds...</p>}
                            </div>

                            <div>
                                <label htmlFor="pet-age" className="block text-sm font-medium text-gray-700 mb-1">
                                    Age
                                </label>
                                <select
                                    id="pet-age"
                                    value={filters.age}
                                    onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Select Age</option>
                                    <option value="baby">Baby</option>
                                    <option value="young">Young</option>
                                    <option value="adult">Adult</option>
                                    <option value="senior">Senior</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="pet-size" className="block text-sm font-medium text-gray-700 mb-1">
                                    Size
                                </label>
                                <select
                                    id="pet-size"
                                    value={filters.size}
                                    onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Select Size</option>
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                    <option value="xlarge">Extra Large</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="pet-gender" className="block text-sm font-medium text-gray-700 mb-1">
                                    Gender
                                </label>
                                <select
                                    id="pet-gender"
                                    value={filters.gender}
                                    onChange={(e) => setFilters(prev => ({ ...prev, gender: e.target.value }))}
                                    className="w-full border rounded-lg p-2"
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            {filters.location && (
                                <div>
                                    <label htmlFor="distance" className="block text-sm font-medium text-gray-700 mb-1">
                                        Distance
                                    </label>
                                    <select
                                        id="distance"
                                        value={filters.distance}
                                        onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                                        className="w-full border rounded-lg p-2"
                                    >
                                        <option value="10">10 miles</option>
                                        <option value="25">25 miles</option>
                                        <option value="50">50 miles</option>
                                        <option value="100">100 miles</option>
                                        <option value="500">500 miles</option>
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Search Results and No Results Message */}
            {petsData?.searchPetfinderPets?.animals?.length === 0 && !isSearching && (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">No pets found</h3>
                    <p className="text-gray-600 mb-4">Try adjusting your search criteria to find more pets.</p>
                </div>
            )}

            {!petsData && !isSearching && !petsLoading && (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <h3 className="text-xl font-semibold mb-2">Ready to search</h3>
                    <p className="text-gray-600 mb-4">Enter your criteria above and click Search to find pets.</p>
                </div>
            )}

            {(isSearching || petsLoading) && (
                <div className="text-center py-16 bg-white rounded-lg shadow">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Searching for pets...</p>
                </div>
            )}

            {petsData?.searchPetfinderPets?.animals && petsData.searchPetfinderPets.animals.length > 0 && !isSearching && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {petsData?.searchPetfinderPets?.animals?.map((pet: Pet) => (
                        <div
                            key={`pet-${pet.id}`} // Include a prefix to make the key more unique
                            className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-200 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
                            onClick={() => setSelectedPet(pet)}
                            aria-label={`View details for ${pet.name}`}
                        >
                            <div className="relative h-48">
                                <img
                                    src={pet.photos && pet.photos.length > 0 ? pet.photos[0]?.medium || pet.photos[0]?.small || pet.photos[0]?.large : "/api/placeholder/400/300"}
                                    alt={pet.name}
                                    className="w-full h-full object-cover object-center"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = "/api/placeholder/400/300";
                                    }}
                                />
                                {isLoggedIn && (
                                    <button
                                        className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-gray-500 hover:text-pink-500 transition-colors"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedPet(pet);
                                        }}
                                        aria-label={`Save ${pet.name} to favorites`}
                                    >
                                        <Heart className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                            <div className="p-4 space-y-2">
                                <h3 className="font-semibold text-lg text-gray-800">{pet.name}</h3>
                                <p className="text-gray-600">{pet.breeds.primary}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                        {pet.age}
                                    </span>
                                    <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                                        {pet.gender}
                                    </span>
                                    <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                        {pet.size}
                                    </span>
                                </div>
                                <p className="text-gray-600 flex items-center text-sm">
                                    <MapPin className="w-4 h-4 mr-1 inline" />
                                    {pet.contact.address.city}, {pet.contact.address.state}
                                    {pet.distance !== undefined && (
                                        <span className="ml-1">
                                            ({Math.round(pet.distance)} miles)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {petsData?.searchPetfinderPets?.pagination && petsData.searchPetfinderPets.animals.length > 0 && !isSearching && (
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={filters.page <= 1 || isSearching || petsLoading}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            aria-label="Previous page"
                        >
                            Previous
                        </button>

                        <div className="flex gap-2">
                            {filters.page > 3 && (
                                <>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        aria-label="Page 1"
                                        disabled={isSearching || petsLoading}
                                    >
                                        1
                                    </button>
                                    <span className="px-2 flex items-center">...</span>
                                </>
                            )}

                            {renderPaginationButtons().map((button, index) => (
                                <div key={`page-button-${index}`}>
                                    {button}
                                </div>
                            ))}

                            {filters.page < petsData?.searchPetfinderPets?.pagination.total_pages - 2 && (
                                <>
                                    <span className="px-2 flex items-center">...</span>
                                    <button
                                        onClick={() => setFilters(prev => ({ ...prev, page: petsData?.searchPetfinderPets?.pagination.total_pages }))}
                                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                        aria-label={`Page ${petsData?.searchPetfinderPets?.pagination.total_pages}`}
                                        disabled={isSearching || petsLoading}
                                    >
                                        {petsData?.searchPetfinderPets?.pagination.total_pages}
                                    </button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={filters.page >= petsData?.searchPetfinderPets?.pagination.total_pages || isSearching || petsLoading}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            aria-label="Next page"
                        >
                            Next
                        </button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Show:</span>
                            <select
                                value={filters.limit}
                                onChange={(e) => setFilters(prev => ({
                                    ...prev,
                                    limit: parseInt(e.target.value),
                                    page: 1 // Reset to first page when changing limit
                                }))}
                                className="border rounded-lg p-2 pr-8"
                                aria-label="Results per page"
                                disabled={isSearching || petsLoading}
                            >
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={40}>40</option>
                            </select>
                            <span className="text-sm text-gray-600">per page</span>
                        </div>

                        <span className="text-sm text-gray-600">
                            {petsData?.searchPetfinderPets?.pagination.total_count} total results
                        </span>
                    </div>
                </div>
            )}

            {/* Pet Detail Modal */}
            {selectedPet && (
                <PetDetailModal
                    pet={selectedPet}
                    onClose={() => setSelectedPet(null)}
                />
            )}
        </div>
    );
};

export default PetSearch;