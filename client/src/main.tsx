import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import '../src/App.css'

import App from './App.jsx'
import Home from './pages/Home.js'
import LoginForm from './components/auth/LoginForm.js'
import Error from './pages/Error.js'

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
                index: true,
                element: <LoginForm />,
                errorElement: <Error />,
            }
        ]
    }
])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
