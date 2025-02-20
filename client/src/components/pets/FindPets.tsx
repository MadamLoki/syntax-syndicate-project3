import { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Search, Filter, X } from 'lucide-react';
import {
    SEARCH_PETFINDER_PETS,
    GET_PETFINDER_TYPES,
    GET_PETFINDER_BREEDS
} from '../../utils/petfinderQueries';
import { ErrorBoundary } from '../ErrorBoundary';
import { ErrorMessage } from '../ErrorMessage';
import { LoadingError } from '../LoadingError';
import { PetfinderApiError } from '../../types/errors';

interface SearchFilters {
    type: string;
    breed: string;
    size: string;
    gender: string;
    age: string;
    location: string;
    distance: string;
}

const FindPets = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<SearchFilters>({
        type: '',
        breed: '',
        size: '',
        gender: '',
        age: '',
        location: '',
        distance: '100'
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchErrorState, setSearchErrorState] = useState<Error | null>(null);

    // Queries with error handling
    const { data: typesData, error: typesError, refetch: refetchTypes } = useQuery(GET_PETFINDER_TYPES, {
        onError: (error) => {
            console.error('Error fetching pet types:', error);
            if (error.networkError) {
                console.log('Network error:', error.networkError);
            }
            if (error.graphQLErrors) {
                console.log('GraphQL errors:', error.graphQLErrors);
            }
        }
    });

    const [getBreeds, {
        data: breedsData,
    }] = useLazyQuery(GET_PETFINDER_BREEDS, {
        onError: (error) => {
            console.error('Error fetching breeds:', error);
            if (error.networkError) {
                setSearchErrorState(new Error('Network error. Please check your connection.'));
            } else if (error.graphQLErrors?.length > 0) {
                setSearchErrorState(new Error(error.graphQLErrors[0].message));
            }
        }
    });

    const [searchPets, {
        loading,
        error: searchError,
        data: petsData,
    }] = useLazyQuery(SEARCH_PETFINDER_PETS, {
        onError: (error) => {
            // Convert Apollo error to PetfinderApiError if applicable
            const petfinderError = error.graphQLErrors?.[0]?.extensions?.response;
            if (petfinderError) {
                setSearchErrorState(new PetfinderApiError(petfinderError));
            } else {
                setSearchErrorState(error);
            }
        }
    });

    // Handle type change with error handling
    const handleTypeChange = async (type: string) => {
        try {
            handleFilterChange('type', type);
            if (type) {
                await getBreeds({
                    variables: { type: type.toLowerCase() },
                    onError: (error) => {
                        console.error('Error fetching breeds:', error);
                        // Handle breed fetch error
                        const petfinderError = error.graphQLErrors?.[0]?.extensions?.response;
                        if (petfinderError) {
                            setSearchErrorState(new PetfinderApiError(petfinderError));
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error handling type change:', error);
        }
    };

    const handleSearch = async () => {
        try {
            setSearchErrorState(null);
            const searchVars = {
                input: {
                    ...filters,
                    name: searchTerm,
                    distance: parseInt(filters.distance),
                    limit: 100
                }
            };
            await searchPets({ variables: searchVars });
        } catch (error) {
            console.error('Error performing search:', error);
        }
    };

    const handleFilterChange = (key: keyof SearchFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setSearchErrorState(null); // Clear any previous errors
    };

    const clearFilters = () => {
        setFilters({
            type: '',
            breed: '',
            size: '',
            gender: '',
            age: '',
            location: '',
            distance: '100'
        });
        setSearchTerm('');
        setSearchErrorState(null);
    };

    // Render error states
    if (typesError) {
        return (
            <LoadingError
                error={typesError}
                onRetry={() => refetchTypes()}
            />
        );
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    {/* Search Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Find Your Perfect Pet
                        </h1>
                        <p className="text-gray-600">
                            Search through available pets and find your new companion
                        </p>
                    </div>

                    {/* Error Message Display */}
                    {searchErrorState && (
                        <ErrorMessage
                            error={searchErrorState}
                            className="mb-4"
                        />
                    )}

                    {/* Search Bar and Filters */}
                    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search pets..."
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSearchErrorState(null);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                <Filter className="w-5 h-5" />
                                Filters
                            </button>
                        </div>

                        {/* Filter Panel */}
                        {isFilterOpen && (
                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-semibold">Filters</h3>
                                    <button
                                        onClick={clearFilters}
                                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <X className="w-4 h-4" />
                                        Clear all
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Search Radius</label>
                                        <select
                                            value={filters.distance}
                                            onChange={(e) => handleFilterChange('distance', e.target.value)}
                                            className="w-full border border-gray-300 rounded-lg p-2"
                                        >
                                            <option value="10">10 miles</option>
                                            <option value="25">25 miles</option>
                                            <option value="50">50 miles</option>
                                            <option value="100">100 miles</option>
                                            <option value="500">500 miles</option>
                                        </select>
                                    </div>
                                    <select
                                        value={filters.type}
                                        onChange={(e) => handleTypeChange(e.target.value)}
                                        className="border border-gray-300 rounded-lg p-2"
                                    >
                                        <option value="">Pet Type</option>
                                        {typesData?.getPetfinderTypes?.map((type: string) => (
                                            <option key={type} value={type.toLowerCase()}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.breed}
                                        onChange={(e) => handleFilterChange('breed', e.target.value)}
                                        className="border border-gray-300 rounded-lg p-2"
                                        disabled={!filters.type}
                                    >
                                        <option value="">Breed</option>
                                        {breedsData?.getPetfinderBreeds?.map((breed: string) => (
                                            <option key={breed} value={breed}>
                                                {breed}
                                            </option>
                                        ))}
                                    </select>

                                    <select
                                        value={filters.age}
                                        onChange={(e) => handleFilterChange('age', e.target.value)}
                                        className="border border-gray-300 rounded-lg p-2"
                                    >
                                        <option value="">Age</option>
                                        <option value="baby">Baby</option>
                                        <option value="young">Young</option>
                                        <option value="adult">Adult</option>
                                        <option value="senior">Senior</option>
                                    </select>

                                    <select
                                        value={filters.size}
                                        onChange={(e) => handleFilterChange('size', e.target.value)}
                                        className="border border-gray-300 rounded-lg p-2"
                                    >
                                        <option value="">Size</option>
                                        <option value="small">Small</option>
                                        <option value="medium">Medium</option>
                                        <option value="large">Large</option>
                                        <option value="xlarge">Extra Large</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {loading ? (
                            <div className="col-span-full text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="mt-4 text-gray-600">Loading pets...</p>
                            </div>
                        ) : searchErrorState ? (
                            <div className="col-span-full">
                                <LoadingError
                                    error={searchError ?? null}
                                    onRetry={handleSearch}
                                />
                            </div>
                        ) : petsData?.pets?.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-gray-600">No pets found matching your criteria.</p>
                            </div>
                        ) : (
                            petsData?.pets?.map((pet: any) => (
                                <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                        <img
                                            src={pet.photos[0]?.medium || "/api/placeholder/400/300"}
                                            alt={pet.name}
                                            className="object-cover w-full h-48"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{pet.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                                {pet.breeds.primary}
                                            </span>
                                            <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                                {pet.age}
                                            </span>
                                            <span className={`px-2 py-1 rounded-full text-sm ${pet.status === 'adoptable'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {pet.status}
                                            </span>
                                        </div>
                                        <div className="text-sm text-gray-600 mb-4">
                                            <p>{pet.contact.address.city}, {pet.contact.address.state}</p>
                                        </div>
                                        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

export default FindPets;