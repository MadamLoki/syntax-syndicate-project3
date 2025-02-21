import { useState, useEffect } from 'react';
import { ApolloError } from '@apollo/client';
import { useQuery, useLazyQuery } from '@apollo/client';
import { Search, Filter } from 'lucide-react';
import {
    SEARCH_PETFINDER_PETS,
    GET_PETFINDER_TYPES,
    GET_PETFINDER_BREEDS
} from '../../utils/petfinderQueries';

interface Pet {
    id: string;
    name: string;
    breeds: {
        primary: string;
    };
    age: string;
    size: string;
    contact: {
        address: {
            city: string;
            state: string;
        };
    };
    photos: {
        medium: string;
    }[];
}

const PetSearch = () => {
    const [filters, setFilters] = useState<Filters>(() => {
        const savedFilters = localStorage.getItem('petSearchFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            type: '',
            breed: '',
            size: '',
            gender: '',
            age: '',
            location: '',
            distance: '100'
        };
    });

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('petSearchFilters', JSON.stringify(filters));
    }, [filters]);

    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState<ApolloError | null>(null);
    const [location, setLocation] = useState<string>('');

    // Fetch types with error handling and retry logic
    const { data: typesData, loading: typesLoading, refetch: refetchTypes } = useQuery(GET_PETFINDER_TYPES, {
        onError: (error) => {
            console.error('GraphQL error:', error);
        }
    });

    // Lazy query for breeds
    const [getBreeds, { data: breedsData, loading: breedsLoading }] = useLazyQuery(GET_PETFINDER_BREEDS, {
        onError: (error) => {
            console.error('Error fetching breeds:', error);
            setError(error);
        }
    });

    // Lazy query for pet search
    const [searchPets, { data: petsData, loading: petsLoading }] = useLazyQuery(SEARCH_PETFINDER_PETS, {
        onError: (error) => {
            console.error('Error searching pets:', error);
            setError(error);
        },
        fetchPolicy: 'network-only'
    });

    interface Filters {
        type: string;
        breed: string;
        size: string;
        gender: string;
        age: string;
        location: string;
        distance: string;
    }

    const handleTypeChange = async (type: string) => {
        try {
            setFilters((prev: Filters) => ({ ...prev, type, breed: '' }));
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

    const handleSearch = async () => {
        try {
            await searchPets({
                variables: {
                    input: {
                        ...filters,
                        name: searchTerm,
                        distance: parseInt(filters.distance),
                        limit: 100
                    }
                }
            });
        } catch (err) {
            console.error('Error performing search:', err);
            setError(err as ApolloError);
        }
    };

    if (typesLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
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
                    onClick={() => refetchTypes()}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Find Your Next Best Friend</h1>
                <p className="text-gray-600">Search through available pets near you, or around the world.</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 mb-8">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 relative flex gap-4">
                        <div className="relative flex-1">
                            <input type="text" placeholder="Search pets..." onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                            <Search className="absolute left-3 top-3 text-gray-400" />
                        </div>
                        <div className="relative flex-1">
                            <input type="text" placeholder="Zipcode" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg" />
                        </div>
                    </div>
                    <button onClick={() => setIsFilterOpen(!isFilterOpen)} className="px-4 py-2 border rounded-lg hover:bg-gray-50" >
                        <Filter className="w-5 h-5" />
                        Filters
                    </button>
                    <button onClick={handleSearch} disabled={petsLoading} className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600" >
                        {petsLoading ? 'Searching...' : 'Search'}
                    </button>
                </div>

                {isFilterOpen && (
                    <div className="border-t pt-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <select value={filters.type} onChange={(e) => handleTypeChange(e.target.value)} className="border rounded-lg p-2" >
                                <option value="">Select Type</option>
                                {typesData?.getPetfinderTypes?.map((type: string) => (
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
                                {breedsData?.getPetfinderBreeds?.map((breed: string) => (
                                    <option key={breed} value={breed}>
                                        {breed}
                                    </option>
                                ))}
                            </select>

                            <select value={filters.age} onChange={(e) => setFilters(prev => ({ ...prev, age: e.target.value }))} className="border rounded-lg p-2" >
                                <option value="">Select Age</option>
                                <option value="baby">Baby</option>
                                <option value="young">Young</option>
                                <option value="adult">Adult</option>
                                <option value="senior">Senior</option>
                            </select>

                            <select value={filters.size} onChange={(e) => setFilters(prev => ({ ...prev, size: e.target.value }))} className="border rounded-lg p-2" >
                                <option value="">Select Size</option>
                                <option value="small">Small</option>
                                <option value="medium">Medium</option>
                                <option value="large">Large</option>
                                <option value="xlarge">Extra Large</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {petsData?.searchPetfinderPets?.animals?.map((pet: Pet) => (
                    <div key={pet.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden transition-transform duration-200 hover:shadow-lg hover:scale-[1.02]" >
                        <img src={pet.photos[0]?.medium || "https://cdn.midjourney.com/1ddbe082-8d75-46bc-b99e-7400b10a1c75/0_1.png"} alt={pet.name} className="w-full h-48 object-cover object-center" />
                        <div className="p-4 space-y-2">
                            <h3 className="font-semibold text-lg text-gray-800">{pet.name}</h3>
                            <p className="text-gray-600">{pet.breeds.primary}</p>
                            <p className="text-gray-600">{pet.age} • {pet.size}</p>
                            <p className="text-gray-600">{pet.contact.address.city}, {pet.contact.address.state}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PetSearch;