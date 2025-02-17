import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { ADD_PROFILE } from '../../utils/mutations';

interface FormData {
    username: string;
    name: string;
    email: string;
    password: string;
}

const SignupForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        username: '',
        name: '',
        email: '',
        password: ''
    });
    const [formErrors, setFormErrors] = useState<Partial<FormData>>({});
    const [signupError, setSignupError] = useState('');

    const [addUser, { loading }] = useMutation(ADD_PROFILE, {
        onCompleted: (data) => {
            const token = data.addProfile.token;
            localStorage.setItem('id_token', token);
            navigate('/'); // Redirect after successful signup
        },
        onError: (error) => {
            setSignupError(error.message);
        }
    });

    const validateForm = (): boolean => {
        const errors: Partial<FormData> = {};
        if (!formData.email) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (!formData.username) {
            errors.username = 'Username is required';
        }
        if (!formData.name) {
            errors.name = 'Name is required';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value
        }));
        // Clear errors when user starts typing
        if (formErrors[name as keyof FormData]) {
            setFormErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
        }
        if (signupError) {
            setSignupError('');
        }
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (validateForm()) {
            try {
                await addUser({
                    variables: {
                        input: formData
                    }
                });
            } catch (error) {
                console.error('Signup error:', error);
                setSignupError('An error occurred during signup');
            }
        }
    };

    return (
        <div className="min-h-screen w-full bg-gray-200 px-4 py-6 sm:px-6 md:py-10">
            <div className="mx-auto max-w-5xl">
                <div className="flex flex-col md:flex-row shadow-md rounded-lg overflow-hidden">
                    {/* Form Section */}
                    <div className="w-full md:w-1/2 bg-white p-6 sm:p-8 md:p-10">
                        <div className="max-w-md mx-auto">
                            <h1 className="text-xl font-semibold">Create Account</h1>
                            <small className="text-gray-400 block mt-1">Please fill in your information to get started</small>
                            {signupError && ( <div className="mt-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded"> {signupError} </div> )}
                            <form className="mt-6" onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="mb-2 block text-xs font-semibold">Name</label>
                                    <input type="text" name="name" value={formData.name} onChange={handleInputChange} placeholder="Enter your full name" className={`block w-full rounded-md border ${formErrors.name ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-500`} />
                                    {formErrors.name && ( <p className="mt-1 text-xs text-red-500">{formErrors.name}</p> )}
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2 block text-xs font-semibold">Username</label>
                                    <input type="text" name="username" value={formData.username} onChange={handleInputChange} placeholder="Choose a username" className={`block w-full rounded-md border ${formErrors.username ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-500`} />
                                    {formErrors.username && ( <p className="mt-1 text-xs text-red-500">{formErrors.username}</p> )}
                                </div>

                                <div className="mb-4">
                                    <label className="mb-2 block text-xs font-semibold">Email</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="Enter your email" className={`block w-full rounded-md border ${formErrors.email ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-500`} />
                                    {formErrors.email && ( <p className="mt-1 text-xs text-red-500">{formErrors.email}</p> )}
                                </div>

                                <div className="mb-6">
                                    <label className="mb-2 block text-xs font-semibold">Password</label>
                                    <input type="password" name="password" value={formData.password} onChange={handleInputChange} placeholder="*******" className={`block w-full rounded-md border ${formErrors.password ? 'border-red-500' : 'border-gray-300'} focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700 py-2 px-3 text-gray-500`} />
                                    {formErrors.password && ( <p className="mt-1 text-xs text-red-500">{formErrors.password}</p> )}
                                </div>

                                <div className="space-y-3">
                                    <button type="submit" disabled={loading} className="w-full text-center text-white bg-blue-700 hover:bg-blue-900 px-4 py-2 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors" >
                                        {loading ? 'Creating account...' : 'Create Account'}
                                    </button>

                                    <button type="button" className="w-full flex items-center justify-center border border-gray-300 hover:border-gray-500 px-4 py-2 rounded-md transition-colors" >
                                        <img className="w-5 mr-2" src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA" alt="Google logo" />
                                        Sign up with Google
                                    </button>
                                </div>

                                <div className="text-center mt-6">
                                    <span className="text-xs text-gray-400 font-semibold">Already have an account?</span>
                                    <Link to="/login" className="text-xs font-semibold text-blue-700 ml-1">
                                        Sign in
                                    </Link>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Image Section */}
                    <div className="hidden md:block md:w-1/2">
                        <img
                            className="w-full h-full object-cover"
                            src="https://rescuethebirds.org/templates/rt_ambrosia/custom/images/demo/home/bottom/460_pink.jpg"
                            alt="Rose Breasted Cockatoo img"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupForm;