import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PetfinderApiError } from '../types/errors';

interface LoadingErrorProps {
    error: Error | null;
    onRetry: () => void;
}

export const LoadingError: React.FC<LoadingErrorProps> = ({ error, onRetry }) => {
    if (!error) return null;

    const message = error instanceof PetfinderApiError 
        ? error.getErrorMessage()
        : 'Failed to load data. Please try again.';

    return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
            <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
            <p className="text-gray-700 mb-4 text-center">{message}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Try Again
            </button>
        </div>
    );
};