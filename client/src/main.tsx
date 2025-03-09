import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import './index.css'
import App from './App'
import Home from './pages/Home'
import LoginForm from './components/auth/LoginForm'
import Error from './pages/Error'
import SignupForm from './components/auth/SignupForm'
import PetSearch from './components/pets/FindPets'
//import Shelters from './components/shelters/Shelters'
import About from './pages/About'
import ThreadListPage from './pages/ThreadList'
import CreateThreadForm from './pages/CreateThreadForm'
import ProfilePage from './pages/ProflePage'
import PetDetails from './components/pets/PetDetails'
import Shelters from './components/shelters/Shelters'
//import Calendar from './pages/Calendar'


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
          path: '/pets/:id',
          element: <PetDetails />,
          errorElement: <Error />,
        },
        {
          path: '/forum',
          element: <ThreadListPage />,
          errorElement: <Error />,
        },
        {
          path: '/create-thread',
          element: <CreateThreadForm />,
          errorElement: <Error />,
        },
        {
          path: '/about',
          element: <About />,
          errorElement: <Error />,
        },
        {
          path: '/profile',
          element: <ProfilePage />,
          errorElement: <Error />,
        },
        {
          path: '/shelters',
          element: <Shelters />,
          errorElement: <Error />,
        },
        /*{
          path: '/calander',
          element: <Calendar />,
          errorElement: <Error />,
        },*/
      ]
    }
  ])

ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
