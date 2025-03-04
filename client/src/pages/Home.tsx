import React, { useState } from 'react';
import { ArrowRight, Search, Heart, PawPrint, Home, Users, MessageSquare, Info } from 'lucide-react';

const LandingPage = () => {
    // Using a local navigate function that would be replaced by the actual React Router hook
    const navigate = (path) => {
        console.log(`Navigating to: ${path}`);
        // This would be replaced by the actual navigation
    };
    
    const [searchInput, setSearchInput] = useState('');

    // Handle search input changes
    const handleSearchInputChange = (e) => {
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
    const handleSubmit = (e) => {
        e.preventDefault();
        handleSearch();
    };

    // Features data
    const features = [
        {
            icon: <Search className="w-8 h-8 text-blue-500" />,
            title: "Search & Filter",
            description: "Find pets based on species, breed, age, size, and location all in one place."
        },
        {
            icon: <Heart className="w-8 h-8 text-blue-500" />,
            title: "Save & Compare",
            description: "Save your favorite companions and easily compare them to find your perfect match."
        },
        {
            icon: <MessageSquare className="w-8 h-8 text-blue-500" />,
            title: "Community Forum",
            description: "Connect with other pet lovers, share experiences, and get advice from our supportive community."
        },
        {
            icon: <Home className="w-8 h-8 text-blue-500" />,
            title: "Find Shelters",
            description: "Discover local shelters and rescue organizations with pets available for adoption."
        }
    ];

    // How it works steps
    const steps = [
        {
            number: "1",
            title: "Create an Account",
            description: "Sign up to unlock personalized features like saving favorites and joining our pet community."
        },
        {
            number: "2",
            title: "Search for Pets",
            description: "Use our powerful search filters to find pets that match your lifestyle and preferences."
        },
        {
            number: "3",
            title: "Connect with Shelters",
            description: "Reach out directly to shelters or rescue organizations for more information about your chosen pet."
        },
        {
            number: "4",
            title: "Complete the Adoption",
            description: "Follow the shelter's adoption process and welcome your new best friend home!"
        }
    ];

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
                
                {/* Wave Divider */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 160" className="fill-gray-50">
                        <path d="M0,128L80,117.3C160,107,320,85,480,90.7C640,96,800,128,960,138.7C1120,149,1280,139,1360,133.3L1440,128L1440,320L1360,320C1280,320,1120,320,960,320C800,320,640,320,480,320C320,320,160,320,80,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* Search Section */}
            <section className="bg-gray-50 py-12">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-6">
                        <h2 className="text-3xl font-bold text-gray-800">Ready to Start Your Search?</h2>
                        <p className="text-gray-600 text-lg">
                            Enter a location or type of pet you're looking for to begin your journey.
                        </p>
                        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by location (ZIP code) or pet type..."
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
                        <div className="text-sm text-gray-500 mt-2">
                            Examples: "Dog", "Cat", "10001", or browse all available pets
                        </div>
                    </div>
                </div>
            </section>

            {/* Our Mission Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="inline-block p-3 bg-blue-100 rounded-full mb-6">
                            <PawPrint className="w-8 h-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed mb-8">
                            At NewLeash, we believe every pet deserves a loving home and every person deserves to experience the joy of pet companionship. Our platform is designed to break down barriers in the adoption process by connecting shelters, rescues, and potential adopters in one seamless experience.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12">
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="text-blue-600 font-bold text-xl mb-3">For Adopters</div>
                                <p className="text-gray-600">
                                    Find your perfect companion with our powerful search tools, save favorites, and connect directly with shelters.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="text-blue-600 font-bold text-xl mb-3">For Shelters</div>
                                <p className="text-gray-600">
                                    Showcase your animals to a wider audience and connect with potential adopters who match your requirements.
                                </p>
                            </div>
                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="text-blue-600 font-bold text-xl mb-3">For Community</div>
                                <p className="text-gray-600">
                                    Share experiences, offer advice, and participate in a community dedicated to animal welfare.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Everything You Need in One Place</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            NewLeash offers a comprehensive set of tools to make your adoption journey as smooth as possible.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                                <div className="mb-4">{feature.icon}</div>
                                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-16 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">How It Works</h2>
                        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                            Our streamlined process makes finding and adopting a pet simpler than ever before.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {steps.map((step, index) => (
                            <div key={index} className="relative">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg mb-4">
                                    {step.number}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-6 left-12 w-full h-0.5 bg-blue-200"></div>
                                )}
                                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                <p className="text-gray-600">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pet Education Section */}
            <section className="py-16 bg-gray-50">
                <div className="container mx-auto px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-6">Adoption Resources & Education</h2>
                                <p className="text-lg text-gray-600 mb-6">
                                    We're committed to helping you through every step of the pet adoption journey. Our resources provide expert guidance on:
                                </p>
                                <ul className="space-y-4">
                                    <li className="flex items-start">
                                        <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                                            <PawPrint className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="font-semibold">Pet Care Basics</span>
                                            <p className="text-gray-600">Essential information for new pet parents on nutrition, healthcare, and training.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                                            <PawPrint className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="font-semibold">Adoption Process</span>
                                            <p className="text-gray-600">Step-by-step guides to the adoption process, including what questions to ask and what to expect.</p>
                                        </div>
                                    </li>
                                    <li className="flex items-start">
                                        <div className="bg-blue-100 p-1 rounded-full mr-3 mt-1">
                                            <PawPrint className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div>
                                            <span className="font-semibold">Breed-Specific Information</span>
                                            <p className="text-gray-600">Detailed guides on different breeds to help you find the right match for your lifestyle.</p>
                                        </div>
                                    </li>
                                </ul>
                                <button 
                                    className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
                                    onClick={() => navigate('/resources')}
                                >
                                    Explore Resources
                                    <ArrowRight className="ml-2 w-4 h-4" />
                                </button>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <img src="https://www.gsdoc.org/wp-content/uploads/2024/07/dog-training-clipart-cartoon-image-of-dog-trainer-removebg-preview.jpg" alt="Dog training" className="rounded-lg shadow-md" />
                                <img src="https://cdn.pixabay.com/photo/2024/06/03/22/20/ai-generated-8807387_1280.png" alt="Cat care" className="rounded-lg shadow-md" />
                                <img src="https://www.shutterstock.com/image-vector/pet-food-cats-dogs-bowl-600nw-699689020.jpg" alt="Pet nutrition" className="rounded-lg shadow-md" />
                                <img src="https://img.freepik.com/free-vector/veterinarian-with-many-kind-animals_1308-65733.jpg" alt="Pet healthcare" className="rounded-lg shadow-md" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <div className="bg-blue-600 rounded-2xl text-white p-12 text-center">
                        <h2 className="text-3xl font-bold mb-6">Ready to Find Your Perfect Companion?</h2>
                        <p className="text-xl mb-8 max-w-3xl mx-auto">
                            Join thousands of happy pet parents who found their furry, feathered, or scaled family members through NewLeash.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button 
                                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                                onClick={() => navigate('/signup')}
                            >
                                Sign Up Now
                            </button>
                            <button 
                                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                onClick={() => navigate('/about')}
                            >
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;