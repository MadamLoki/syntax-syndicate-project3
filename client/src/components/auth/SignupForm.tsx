import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import Auth from '../../utils/auth';
import type { User } from '../../models/User';
import { AddProfile } from '../../utils/mutations';
import { useMutation } from '@apollo/client';

const SignupForm = () => {
    // set initial form state
  const [userFormData, setUserFormData] = useState<User>({ username: '', name: '', email: '', password: '' });
  const [addUser] = useMutation(AddProfile);


  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setUserFormData({ ...userFormData, [name]: value });
  };

    const handleSubmit =  async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
    
        try {
        //   const response = await createUser(userFormData);
    
        //   if (!response.ok) {
        //     throw new Error('something went wrong!');
        //   }
    
        //   const { token } = await response.json();
        //   Auth.login(token);

        const {email, name, username, password}= userFormData;

        const {data} = await addUser({
            variables: {
                input: { email, name, username, password }
            }
        });

        console.log("response from mutation", data)

        } catch (err) {
          console.error(err);
        //   setShowAlert(true);
        }
    
        setUserFormData({
          username: '',
          name: '',
          email: '',
          password: '',
        });
      };
    return (
        <div>
            <h2 className="text-center">Signup</h2>
            <form className="max-w-sm mx-auto" onSubmit={handleSubmit}>
                <div className="mb-5">
                    <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                    <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@flowbite.com" onChange={handleInputChange}
            value={userFormData.email || ''} required />
                </div>
                <div className="mb-5">
                    <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                    <input type="text" name='name' id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="John Doe" onChange={handleInputChange}
            value={userFormData.name || ''} required />
                </div>
                <div className="mb-5">
                    <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                    <input type="text" name='username' id="username" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="johndoe123" onChange={handleInputChange}
            value={userFormData.username || ''} required />
                </div>
                <div className="mb-5">
                    <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your password</label>
                    <input type="password" name='password' id="password" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" onChange={handleInputChange}
            value={userFormData.password || ''} required />
                </div>
                <button type="submit" className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
            </form>

        </div>
    )
}

export default SignupForm