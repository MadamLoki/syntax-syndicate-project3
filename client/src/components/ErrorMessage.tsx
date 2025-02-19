import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PetfinderApiError } from '../types/errors';

interface ErrorMessageProps {
    error: Error | null;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ error, className = '' }) => {
    if (!error) return null;

    const message = error instanceof PetfinderApiError 
        ? error.getErrorMessage()
        : error.message;

    return (
        <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
            <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                <p className="text-red-700">{message}</p>
            </div>
        </div>
    );
};