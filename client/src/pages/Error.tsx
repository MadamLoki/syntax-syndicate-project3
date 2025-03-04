import React from 'react';
import { useRouteError, useNavigate } from 'react-router-dom';

interface RouteError {
  statusText?: string;
  message?: string;
}

export default function ErrorPage() {
  const error = useRouteError() as RouteError;
  const navigate = useNavigate();
  console.error(error);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-lg shadow-xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row">
        {/* Illustration Section */}
        <div className="w-full lg:w-1/2 bg-blue-50 flex items-center justify-center p-0 overflow-hidden">
          <img 
            src="https://www.dogingtonpost.com/wp-content/uploads/2018/06/LostDog_FB.jpg" 
            alt="Lost dog" 
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
        </div>
        
        {/* Text Content Section */}
        <div className="w-full lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-2 text-gray-500 text-sm font-semibold tracking-wide uppercase">Error 404</div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Oops! Looks like you're lost
          </h1>
          <p className="text-gray-600 mb-8 text-lg">
            The page you are looking for doesn't exist or might have been moved. 
            Let's get you back on track.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => navigate('/')} 
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
            >
              Return Home
            </button>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
            >
              Go Back
            </button>
          </div>
          
          {/* Error Details */}
          {(error.statusText || error.message) && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="text-sm text-gray-500">Error details:</div>
              <div className="text-sm font-mono text-gray-700">
                {error.statusText || error.message}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}