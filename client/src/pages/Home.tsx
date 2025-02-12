import React from 'react';
import { Heart, Users, MessageCircle, ArrowRight, Search } from 'lucide-react';

const LandingPage = () => {
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
                                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                    Browse Pets
                                </button>
                                <button className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                    Join Community
                                </button>
                            </div>
                        </div>
                        <div className="lg:w-1/2 mt-8 lg:mt-0">
                            <img
                                src="/api/placeholder/600/400"
                                alt="Happy dog with owner"
                                className="rounded-lg shadow-xl"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-16">
                <div className="container mx-auto px-6">
                    <h2 className="text-3xl font-bold text-center mb-12">Why Choose NewLeash?</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Heart className="w-12 h-12 text-red-500" />}
                            title="Find Your Match"
                            description="Browse through profiles of adorable pets waiting for their forever homes, with detailed information and photos."
                        />
                        <FeatureCard
                            icon={<Users className="w-12 h-12 text-blue-500" />}
                            title="Community Support"
                            description="Connect with other pet owners, share experiences, and get advice from our supportive community."
                        />
                        <FeatureCard
                            icon={<MessageCircle className="w-12 h-12 text-green-500" />}
                            title="Direct Communication"
                            description="Chat directly with shelters and foster families to learn more about your potential new family member."
                        />
                    </div>
                </div>
            </section>

            {/* Search Section */}
            <section className="bg-gray-100 py-16">
                <div className="container mx-auto px-6">
                    <div className="max-w-3xl mx-auto text-center space-y-8">
                        <h2 className="text-3xl font-bold">Ready to Start Your Search?</h2>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-3 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by location or pet type..."
                                    className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center">
                                Search
                                <ArrowRight className="ml-2 w-4 h-4" />
                            </button>
                        </div>
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
                        <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                            Sign Up Now
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Feature Card Component
const FeatureCard = ({ icon, title, description }) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <div className="flex justify-center mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold mb-4">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );
};

export default LandingPage;