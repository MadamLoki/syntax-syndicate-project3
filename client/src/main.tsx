import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import App from './App'
import Home from './pages/Home'
import LoginForm from './components/auth/LoginForm'
import Error from './pages/Error'
import SignupForm from './components/auth/SignupForm'

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
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
