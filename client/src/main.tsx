import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import App from './App'
import Home from './pages/Home'
import LoginForm from './components/auth/LoginForm'
import Error from './pages/Error'
import SignupForm from './components/auth/SignupForm'
import PetSearch from './components/pets/FindPets'
import Shelters from './components/shelters/Shelters'

const router = createBrowserRouter([
    {
        path: '/',
        element: <App />,
        errorElement: <Error />,
        children: [
            {
                index: true,
                element: <Home />,
                errorElement: <Error />,
            },
            {
                path: '/login',
                element: <LoginForm />,
                errorElement: <Error />,
            },
            {
                path: '/signup',
                element: <SignupForm />,
                errorElement: <Error />,
            },
            {
                path: '/findpets',
                element: <PetSearch />,
                errorElement: <Error />,
            },
            {
                path: '/shelters',
                element: <Shelters />,
                errorElement: <Error />,
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
