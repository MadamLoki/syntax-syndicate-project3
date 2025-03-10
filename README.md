# NewLeash - Find Your New Best Friend 🐾

## Overview

NewLeash is a comprehensive pet adoption platform that connects pet lovers with their perfect animal companions. This full-stack application allows users to search for adoptable pets based on various criteria, save favorite pets, track their adoption journey, and connect with shelters and other pet enthusiasts through a community forum.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Integration](#api-integration)
- [Authentication](#authentication)
- [Deployment](#deployment)
- [Contributors](#contributors)
- [License](#license)

## Features

### For Pet Adopters
- **Advanced Search**: Find pets by type, breed, age, size, gender, and location with distance filtering
- **Pet Details**: View comprehensive information about each pet, including photos, descriptions, and adoption details
- **Save Favorites**: Create an account to save pets you're interested in adopting
- **Adoption Applications**: Submit adoption inquiries directly through the platform
- **User Profiles**: Track your saved pets and adoption journey

### For Shelters
- **Pet Listings**: Easily add and manage adoptable pets in the database
- **Application Management**: Review and respond to adoption applications
- **Shelter Profile**: Maintain shelter information including location displayed on an interactive map

### Community Features
- **Forum**: Participate in discussions about pet adoption, care, and more
- **Pet Ownership**: Add your own pets to your profile and share their stories

## Technologies Used

### Frontend
- **React**: UI building with functional components and hooks
- **TypeScript**: Type-safe code implementation
- **Apollo Client**: GraphQL client for data fetching and state management
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **React Router**: Client-side routing
- **JWT Decode**: Authentication token parsing
- **Lucide React**: Modern icon library

### Backend
- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **TypeScript**: Type-safe server implementation
- **Apollo Server**: GraphQL server implementation
- **GraphQL**: API query language
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JSON Web Tokens (JWT)**: User authentication
- **Bcrypt**: Password hashing

### External API Integrations
- **Petfinder API**: Access to extensive database of adoptable pets
- **Cloudinary**: Image storage and manipulation
- **Google Maps API**: Shelter location visualization

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB connection string

### Setup Steps

1. Clone the repository:
```bash
git clone https://github.com/MadamLoki/syntax-syndicate-project3.git
cd newleash
```

2. Install dependencies:
```bash
npm run render-build
```

3. Create environment files:

Create a `.env` file in the `server` directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET_KEY=your_jwt_secret
PETFINDER_API_KEY=your_petfinder_api_key
PETFINDER_SECRET=your_petfinder_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=3001
```

Create a `.env` file in the `client` directory with:
```
VITE_GOOGLE_MAP_API_KEY=your_google_maps_api_key
VITE_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
```

4. Build the application:
```bash
npm run build
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### Searching for Pets
1. Navigate to the "Find Pets" page
2. Enter search criteria (type, breed, location, etc.)
3. Browse the results and click on pets to view more details

### Account Features
1. Sign up for an account or log in
2. View and update your profile information
3. Save pets to your favorites list
4. Add your own pets to your profile

### Community Interaction
1. Navigate to the "Forum" page
2. Browse existing threads or create a new one
3. Share information about pets available for adoption or seeking adoption

## API Integration

### Petfinder API
The application integrates with the Petfinder API to access a vast database of adoptable pets from shelters and rescues across the country. The integration includes:

- Animal types (dogs, cats, birds, etc.)
- Breeds for each animal type
- Comprehensive search parameters
- Detailed pet information
- Contact information for shelters

### Cloudinary
We utilize Cloudinary for image storage and management, offering:

- Secure image uploads
- Optimized image delivery
- Automatic image transformation and resizing
- High availability and performance

## Authentication

NewLeash implements JWT (JSON Web Token) authentication to secure user accounts and data:

- Secure password storage with bcrypt hashing
- Token-based authentication for API requests
- Protected routes for authenticated users
- User-specific data access controls

## Deployment

The application is deployed using Render with the following components:

- Web Service for the Node.js backend
- Static Site for the React frontend
- MongoDB Atlas for the database

## Contributors

- Sara Ryan
- Adebanjo Fajemisin
- Shelia Bradford
- Joshua Loller

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

© 2025 NewLeash. All Rights Reserved.
