import { useState, useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Search, Filter, MapPin } from 'lucide-react';
import {
    SEARCH_PETFINDER_PETS,
    GET_PETFINDER_TYPES,
    GET_PETFINDER_BREEDS
} from '../../utils/petfinderQueries';

const PetSearch = () => {
    const [filters, setFilters] = useState(() => {
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
            limit: 20
        };
    });

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    // Save filters to localStorage
    useEffect(() => {
        localStorage.setItem('petSearchFilters', JSON.stringify(filters));
    }, [filters]);

    const { data: typesData, loading: typesLoading, refetch: refetchTypes } = useQuery(
        GET_PETFINDER_TYPES,
        {
            fetchPolicy: 'network-only',
            onError: (error) => setError(error)
        }
    );

    const [getBreeds, { data: breedsData, loading: breedsLoading }] = useLazyQuery(
        GET_PETFINDER_BREEDS,
        {
            onError: (error) => setError(error)
        }
    );

    const [searchPets, { data: petsData, loading: petsLoading }] = useLazyQuery(
        SEARCH_PETFINDER_PETS,
        {
            onError: (error) => setError(error),
            fetchPolicy: 'network-only'
        }
    );

    const handleTypeChange = async (type) => {
        try {
            setFilters(prev => ({ ...prev, type, breed: '' }));
            if (type) {
                await getBreeds({
                    variables: { type: type.toLowerCase() }
                });
            }
        } catch (err) {
            setError(err);
        }
    };

    const handleSearch = async () => {
        try {
            const searchParams = {
                limit: filters.limit, // Use the selected limit from filters
                page: filters.page,   // Include the current page
                name: searchTerm || undefined,
                type: filters.type || undefined,
                breed: filters.breed || undefined,
                size: filters.size || undefined,
                gender: filters.gender || undefined,
                age: filters.age || undefined,
                location: filters.location || undefined,
                distance: filters.location ? parseInt(filters.distance) : undefined
            };

            // Remove undefined values
            Object.keys(searchParams).forEach(key => 
                searchParams[key] === undefined && delete searchParams[key]
            );

            await searchPets({
                variables: {
                    input: searchParams
                }
            });
        } catch (err) {
            setError(err);
        }
    };

    // Trigger search when page or limit changes
    useEffect(() => {
        if (petsData) {
            handleSearch();
        }
    }, [filters.page, filters.limit]);

    // Reset to first page when other filters change
    useEffect(() => {
        setFilters(prev => ({
            ...prev,
            page: 1
        }));
    }, [filters.type, filters.breed, filters.size, filters.gender, filters.age, filters.location, filters.distance]);

    if (typesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
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
                    onClick={() => refetchTypes()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    const totalPages = petsData?.searchPetfinderPets?.pagination?.total_pages || 1;
    const currentPage = filters.page;
    const totalResults = petsData?.searchPetfinderPets?.pagination?.total_count || 0;

    const renderPaginationButtons = () => {
        const pages = [];
        
        // Always show first page
        if (currentPage > 3) {
            pages.push(
                <button
                    key={1}
                    onClick={() => setFilters(prev => ({ ...prev, page: 1 }))}
                    className="px-3 py-1 rounded border hover:bg-gray-50"
                >
                    1
                </button>
            );
            if (currentPage > 4) {
                pages.push(<span key="ellipsis1">...</span>);
            }
        }

        // Show pages around current page
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => setFilters(prev => ({ ...prev, page: i }))}
                    className={`px-3 py-1 rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'border hover:bg-gray-50'}`}
                >
                    {i}
                </button>
            );
        }

        // Always show last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(<span key="ellipsis2">...</span>);
            }
            pages.push(
                <button
                    key={totalPages}
                    onClick={() => setFilters(prev => ({ ...prev, page: totalPages }))}
                    className="px-3 py-1 rounded border hover:bg-gray-50"
                >
                    {totalPages}
                </button>
            );
        }

        return pages;
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Search Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find Your Next Best Friend</h1>
                <p className="text-gray-600">Search through available pets near you, or around the world.</p>
            </div>

            {/* Search Controls */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative flex gap-4">
                        <div className="relative flex-1">
                            <input 
                                type="text" 
                                placeholder="Search pets..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="w-full pl-10 pr-4 py-2 border rounded-lg" 
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
                            />
                            <MapPin className="absolute left-3 top-3 text-gray-400" />
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)} 
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                    <button 
                        onClick={handleSearch} 
                        disabled={petsLoading} 
                        className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-300"
                    >
                        {petsLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {/* Filter Controls */}
                {isFilterOpen && (
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <select 
                                value={filters.type} 
                                onChange={(e) => handleTypeChange(e.target.value)} 
                                className="border rounded-lg p-2"
                            >
                                <option value="">Select Type</option>
                                {typesData?.getPetfinderTypes?.map((type) => (
                                    <option key={type} value={type}>
                                        {type}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={filters.breed}
                                onChange={(e) => setFilters(prev => ({ ...prev, breed: e.target.value }))}
                                disabled={!filters.type || breedsLoading}
                                className="border rounded-lg p-2"
                            >
                                <option value="">Select Breed</option>
                                {breedsData?.getPetfinderBreeds?.map((breed) => (
                                    <option key={breed} value={breed}>
                                        {breed}
                                    </option>
                                ))}
                            </select>

                            <select 
                                value={filters.age} 
                                onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))} 
                                className="border rounded-lg p-2"
                            >
                                <option value="">Select Age</option>
                                <option value="baby">Baby</option>
                                <option value="young">Young</option>
                                <option value="adult">Adult</option>
                                <option value="senior">Senior</option>
                            </select>

                            <select 
                                value={filters.size} 
                                onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))} 
                                className="border rounded-lg p-2"
                            >
                                <option value="">Select Size</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xlarge">Extra Large</option>
                            </select>

                            {filters.location && (
                                <select
                                    value={filters.distance}
                                    onChange={(e) => setFilters(prev => ({ ...prev, distance: e.target.value }))}
                                    className="border rounded-lg p-2"
                                >
                                    <option value="10">10 miles</option>
                                    <option value="25">25 miles</option>
                                    <option value="50">50 miles</option>
                                    <option value="100">100 miles</option>
                                    <option value="500">500 miles</option>
                                </select>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Pet Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {petsData?.searchPetfinderPets?.animals?.map((pet) => (
                    <div 
                        key={pet.id} 
                        className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-200 hover:shadow-lg hover:scale-[1.02]"
                    >
                        <img 
                            src={pet.photos[0]?.medium || "/api/placeholder/400/300"} 
                            alt={pet.name} 
                            className="w-full h-48 object-cover object-center" 
                        />
                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-lg text-gray-800">{pet.name}</h3>
                            <p className="text-gray-600">{pet.breeds.primary}</p>
                            <p className="text-gray-600">{pet.age} • {pet.size}</p>
                            <p className="text-gray-600">{pet.contact.address.city}, {pet.contact.address.state}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {petsData?.searchPetfinderPets?.pagination && (
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            disabled={currentPage <= 1}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Previous
                        </button>
                        
                        <div className="flex gap-2">
                            {renderPaginationButtons()}
                        </div>

                        <button
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            disabled={currentPage >= totalPages}
                            className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                                className="border rounded-lg p-2"
                            >
                                <option value={20}>20</option>
                                <option value={40}>40</option>
                                <option value={60}>60</option>
                            </select>
                            <span className="text-sm text-gray-600">per page</span>
                        </div>

                        <span className="text-sm text-gray-600">
                            {totalResults} total results
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PetSearch;