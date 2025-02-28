import { useState, useEffect } from 'react';
import { Heart, Github, Leaf, MessageSquare, Coffee } from 'lucide-react';

const About = () => {
    const [teamMembers, setTeamMembers] = useState([
            {
                name: 'Sara Ryan',
                bio: 'Bio Here',
                github: 'https://github.com/MadamLoki',
                avatar: 'https://avatars.githubusercontent.com/u/25068030?v=4',
                contributions: 0
            },
            {
                name: 'Adebanjo Fajemisin',
                bio: 'Bio Here',
                github: 'https://github.com/AOF-O5-1',
                avatar: 'https://avatars.githubusercontent.com/u/180471026?v=4',
                contributions: 0
            },
            {
                name: 'Shelia Bradford',
                bio: 'Bio Here',
                github: 'https://github.com/SBradford4',
                avatar: 'https://avatars.githubusercontent.com/u/180795418?v=4',
                contributions: 0
            },
            {
                name: 'Joshua Loller',
                bio: 'Bio Here',
                github: 'https://github.com/kiv1515',
                avatar: 'https://avatars.githubusercontent.com/u/180589699?v=4',
                contributions: 0
            }
        ]);
    
    // Fetch contributors from GitHub API
    useEffect(() => {
        const fetchContributors = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/MadamLoki/syntax-syndicate-project3/contributors');
                if (response.ok) {
                    const contributors = await response.json();
                    
                    // Map contributors to team members format, preserving existing data where possible
                    interface Contributor {
                        login: string;
                        html_url: string;
                        avatar_url: string;
                        contributions: number;
                    }

                    interface TeamMember {
                        name: string;
                        bio: string;
                        github: string;
                        avatar: string;
                        contributions: number;
                    }

                    const updatedMembers: TeamMember[] = contributors.map((contributor: Contributor) => {
                        // Try to find an existing team member with matching GitHub username
                        const existingMember = teamMembers.find(
                            member => member.github.toLowerCase().includes(contributor.login.toLowerCase())
                        );
                        
                        return {
                            name: existingMember?.name || contributor.login,
                            bio: existingMember?.bio || 'Project Contributor',
                            github: contributor.html_url,
                            avatar: contributor.avatar_url,
                            contributions: contributor.contributions
                        };
                    });
                    
                    if (updatedMembers.length > 0) {
                        setTeamMembers(updatedMembers);
                    }
                }
            } catch (error) {
                console.error('Error fetching GitHub contributors:', error);
                // If fetch fails, we'll use the default team members
            }
        };
        
        fetchContributors();
    }, []);

    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Hero Section */}
            <section className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl font-bold text-white sm:text-5xl">
                        About NewLeash
                    </h1>
                    <p className="mt-6 text-xl text-blue-100 max-w-3xl mx-auto">
                        Connecting pet lovers with their perfect companions through technology and compassion.
                    </p>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
                        <div className="mt-10 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 p-3 rounded-full mb-4">
                                    <Heart className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Connect</h3>
                                <p className="text-gray-600 text-center">
                                    Bringing together animals in need with the perfect forever homes.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 p-3 rounded-full mb-4">
                                    <Leaf className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Support</h3>
                                <p className="text-gray-600 text-center">
                                    Empowering shelters and rescues with technology to streamline adoptions.
                                </p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="bg-blue-100 p-3 rounded-full mb-4">
                                    <MessageSquare className="h-8 w-8 text-blue-600" />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Educate</h3>
                                <p className="text-gray-600 text-center">
                                    Fostering a community where pet owners can learn and share experiences.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="prose max-w-none text-gray-600">
                        <p className="text-lg mb-6">
                            At NewLeash, we believe every animal deserves a loving home. Our platform leverages technology to create meaningful connections between shelters, potential adopters, and pets waiting for their forever homes.
                        </p>
                        <p className="text-lg mb-6">
                            Through mutual connections in 2024/2025, our team came together with a shared vision: to revolutionize the pet adoption process and make it more accessible, transparent, and joyful for everyone involved. Connecting pet lovers with their perfect companions through technology and compassion, and the world around them to help communicate and share their experiences.
                        </p>
                        <p className="text-lg">
                            Through our integration with services like Petfinder, we provide a comprehensive database of adoptable pets while offering support and resources for new pet parents throughout their journey.
                        </p>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="py-16 bg-gray-100 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Our Technology</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold mb-2">Frontend</h3>
                            <p className="text-gray-600">React, TypeScript, Tailwind CSS</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold mb-2">Backend</h3>
                            <p className="text-gray-600">Node.js, Express, GraphQL</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold mb-2">Database</h3>
                            <p className="text-gray-600">MongoDB with Mongoose and Apollo Server</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <h3 className="font-semibold mb-2">API Integration</h3>
                            <p className="text-gray-600">Petfinder API, Google Maps, Open AI</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Team Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Meet Our Team</h2>
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {teamMembers.map((member) => (
                            <div key={member.name} className="bg-white rounded-xl shadow-sm overflow-hidden transition-transform duration-300 hover:shadow-md hover:scale-105">
                                <div className="h-48 bg-blue-50 flex justify-center items-center">
                                    <img 
                                        src={member.avatar} 
                                        alt={member.name} 
                                        className="h-32 w-32 rounded-full border-4 border-white"
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                                    {member.contributions && (
                                        <p className="text-blue-600 font-medium text-sm mb-3">
                                            {member.contributions} contribution{member.contributions !== 1 ? 's' : ''}
                                        </p>
                                    )}
                                    <p className="text-gray-600 text-sm mb-4">{member.bio}</p>
                                    <a 
                                        href={member.github} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center text-gray-700 hover:text-blue-600"
                                    >
                                        <Github className="h-4 w-4 mr-2" />
                                        <span className="text-sm">GitHub</span>
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-16 bg-gray-100 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-8">Get in Touch</h2>
                    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <MessageSquare className="h-6 w-6 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-semibold mb-2">Email Us</h3>
                            <p className="text-gray-600">contact@newleash.com</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <Coffee className="h-6 w-6 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-semibold mb-2">Support Our Mission</h3>
                            <p className="text-gray-600">Donations and volunteer opportunities</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                            <Coffee className="h-6 w-6 mx-auto mb-4 text-blue-600" />
                            <h3 className="font-semibold mb-2">Suggestions</h3>
                            <p className="text-gray-600">We'd love to hear your feedback</p>
                        </div>
                    </div>
                    <div className="mt-8">
                        <a 
                            href="https://github.com/MadamLoki/syntax-syndicate-project3"
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Github className="h-5 w-5 mr-2" />
                            Visit Our GitHub
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;