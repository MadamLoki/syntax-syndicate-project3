import React from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    const [searchInput, setSearchInput] = useState('');

    // Handle search input changes
    const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
    };

    // Handle the search action
    const handleSearch = () => {
        if (!searchInput.trim()) return;

        // Determine if the input is likely a zipcode or a pet type
        const isZipCode = /^\d{5}$/.test(searchInput.trim());
        
        // Get existing filters or create new ones
        const savedFilters = localStorage.getItem('petSearchFilters');
        const filters = savedFilters ? JSON.parse(savedFilters) : {
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

        // Update the appropriate filter based on input type
        if (isZipCode) {
            filters.location = searchInput.trim();
        } else {
            filters.type = searchInput.trim();
        }

        // Save the updated filters to localStorage
        localStorage.setItem('petSearchFilters', JSON.stringify(filters));

        // Navigate to the FindPets page
        navigate('/findpets');
    };

    // Handle form submission (when user presses Enter)
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch();
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative bg-blue-600 text-white">
                <div className="container mx-auto px-6 py-16">
                    <div className="flex flex-col lg:flex-row items-center">
                        <div className="lg:w-1/2 space-y-8">
                            <h1 className="text-4xl lg:text-6xl font-bold">
                                Find Your Perfect Companion
                            </h1>
                            <p className="text-xl">
                                Connect with local shelters, pet lovers, and your future furry friend all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors" onClick={() => navigate('/findpets')}>
                                    Browse Pets
                                </button>
                                <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors" onClick={() => navigate('/signup')}>
                                    Join Community
                                </button>
                            </div>
                        </div>
                        <div className="lg:w-1/2 mt-8 lg:mt-0">
                            <img src="https://img.freepik.com/premium-photo/australian-shepherd-dog-1-year-old_926199-2702571.jpg" alt="Happy dog" className="rounded-lg shadow-xl" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl font-bold">Ready to Start Your Search?</h2>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by location or pet type..."
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                    value={searchInput}
                                    onChange={handleSearchInputChange}
                                />
                            </div>
                            <button 
                                type="submit"
                                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                            >
                                Search
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-blue-600 rounded-2xl text-white p-12 text-center">
                        <h2 className="text-3xl font-bold mb-6">Join Our Growing Community</h2>
                        <p className="text-xl mb-8">
                            Connect with thousands of pet lovers and find your perfect companion today.
                        </p>
                        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors" onClick={() => navigate('/signup')}>
                            Sign Up Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;