import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Heart, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const NavBar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { isLoggedIn, logout } = useAuth();

    const handleLogout = () => {
        logout(); 
        navigate('/login');
    };

    return (
        <nav className="dark:bg-gray-800 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo and primary navigation */}
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="text-2xl font-bold text-blue-600">
                                NewLeash
                            </Link>
                        </div>
                        
                        {/* Desktop Navigation */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link to="/findpets" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400 hover:text-blue-600">
                                <Search className="w-4 h-4 mr-1" />
                                Find Pets
                            </Link>
                            <Link to="/shelters" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400 hover:text-blue-600">
                                Shelters
                            </Link>
                            <Link to="/forum" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400 hover:text-blue-600">
                                Forum
                            </Link>
                            <Link to="/about" className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-400 hover:text-blue-600">
                                About
                            </Link>
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="hidden sm:flex items-center space-x-4">
                        {isLoggedIn ? (
                            <>
                                <Link to="/favorites" className="text-gray-700 hover:text-blue-600">
                                    <Heart className="w-6 h-6" />
                                </Link>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                                    <User className="w-6 h-6" />
                                </Link>
                                <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">
                                    <LogOut className="w-6 h-6" />
                                </button>
                            </>
                        ) : (
                            <div className="flex space-x-4">
                                <Link to="/login" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50">
                                    Sign in
                                </Link>
                                <Link to="/signup" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex items-center sm:hidden">
                        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-gray-100" >
                            {isMobileMenuOpen ? ( <X className="block h-6 w-6" /> ) : ( <Menu className="block h-6 w-6" /> )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isMobileMenuOpen && (
                <div className="sm:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link to="/findpets" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                            Find Pets
                        </Link>
                        <Link to="/shelters" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                            Shelters
                        </Link>
                        <Link to="/forum" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                            Forum
                        </Link>
                        <Link to="/about" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                            About
                        </Link>
                        {!isLoggedIn && (
                            <>
                                <Link to="/login" className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                                    Sign in
                                </Link>
                                <Link to="/signup" className="block pl-3 pr-4 py-2 text-base font-medium text-blue-600 hover:bg-gray-50">
                                    Sign up
                                </Link>
                            </>
                        )}
                    </div>
                    {isLoggedIn && (
                        <div className="pt-4 pb-3 border-t border-gray-200">
                            <div className="flex items-center px-4 space-x-4">
                                <Link to="/favorites" className="text-gray-700 hover:text-blue-600">
                                    <Heart className="w-6 h-6" />
                                </Link>
                                <Link to="/profile" className="text-gray-700 hover:text-blue-600">
                                    <User className="w-6 h-6" />
                                </Link>
                                <button onClick={handleLogout} className="text-gray-700 hover:text-blue-600">
                                    <LogOut className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default NavBar;