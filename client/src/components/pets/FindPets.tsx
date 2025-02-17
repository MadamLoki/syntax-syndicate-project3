import { useState } from 'react';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Search, Filter, X } from 'lucide-react';
import { SEARCH_PETFINDER_PETS, GET_PETFINDER_TYPES, GET_PETFINDER_BREEDS } from '../../utils/petfinderQueries';
import { Link } from 'react-router-dom';

const FindPets = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        breed: '',
        size: '',
        gender: '',
        age: '',
        location: '',
        distance: '100'
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const { data: typesData } = useQuery(GET_PETFINDER_TYPES);
    const [getBreeds, { data: breedsData }] = useLazyQuery(GET_PETFINDER_BREEDS);
    const [searchPets, { loading, error, data: petsData }] = useLazyQuery(SEARCH_PETFINDER_PETS);

    const handleTypeChange = (type: string) => {
        handleFilterChange('type', type);
        if (type) {
            getBreeds({ variables: { type: type.toLowerCase() } });
        }
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleSearch = () => {
        searchPets({
            variables: {
                input: {
                    ...filters,
                    name: searchTerm,
                    distance: parseInt(filters.distance),
                    limit: 100
                }
            }
        });
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
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header Section */}
            <div className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Pet</h1>
                    <p className="mt-2 text-gray-600">Search through available pets and find your new companion</p>
                </div>
            </div>

            {/* Search and Filters Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-lg shadow p-6">
                    {/* Search Bar */}
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-3 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search pets..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 sm:w-auto"
                        >
                            <Filter className="w-5 h-5 mr-2" />
                            Filters
                        </button>
                        <button
                            onClick={handleSearch}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Search
                        </button>
                    </div>

                    {/* Filters Panel */}
                    {isFilterOpen && (
                        <div className="mt-4 border-t pt-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-700">Filters</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                >
                                    <X className="w-4 h-4" />
                                    Clear all
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <select
                                    value={filters.type}
                                    onChange={(e) => handleTypeChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Pet Type</option>
                                    {typesData?.getPetfinderTypes?.map((type: string) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.breed}
                                    onChange={(e) => handleFilterChange('breed', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Breed</option>
                                    {breedsData?.getPetfinderBreeds?.map((breed: string) => (
                                        <option key={breed} value={breed}>{breed}</option>
                                    ))}
                                </select>

                                <select
                                    value={filters.age}
                                    onChange={(e) => handleFilterChange('age', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <div className="mt-6">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Loading pets...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600">Error loading pets. Please try again later.</p>
                        </div>
                    ) : petsData?.searchPetfinderPets?.animals?.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-600">No pets found matching your criteria.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {petsData?.searchPetfinderPets?.animals?.map((pet: any) => (
                                <div key={pet.id} className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                                        <img
                                            src={pet.photos?.[0]?.medium || "/api/placeholder/400/300"}
                                            alt={pet.name}
                                            className="object-cover w-full h-48"
                                        />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold text-lg mb-2">{pet.name}</h3>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {pet.breeds?.primary && (
                                                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                                    {pet.breeds.primary}
                                                </span>
                                            )}
                                            {pet.age && (
                                                <span className="px-2 py-1 bg-gray-100 rounded-full text-sm">
                                                    {pet.age}
                                                </span>
                                            )}
                                            <span className={`px-2 py-1 rounded-full text-sm ${pet.status === 'adoptable'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {pet.status}
                                            </span>
                                        </div>
                                        <Link
                                            to={`/pet/${pet.id}`}
                                            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindPets;