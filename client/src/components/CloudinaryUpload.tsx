import React, { useState, useCallback, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';
import { uploadImage } from '../utils/CloudinaryService';

interface CloudinaryUploadProps {
    onImageUploaded: (imageData: { 
        url: string; 
        publicId: string;
    }) => void;
    initialImage?: string;
    className?: string;
    maxSize?: number; // in MB
    accept?: string[];
}

const CloudinaryUpload: React.FC<CloudinaryUploadProps> = ({
    onImageUploaded,
    initialImage = '',
    className = '',
    maxSize = 10, // Default 10MB
    accept = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
}) => {
    const [imagePreview, setImagePreview] = useState<string>(initialImage);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [error, setError] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    const resetUpload = () => {
        setUploadProgress(0);
        setError('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const processFile = async (file: File) => {
        try {
            // Basic validation
            if (!accept.includes(file.type)) {
                setError(`Invalid file type. Accepted types: ${accept.map(type => type.split('/')[1]).join(', ')}`);
                return;
            }

            if (file.size > maxSize * 1024 * 1024) {
                setError(`File is too large. Maximum size is ${maxSize}MB.`);
                return;
            }

            setIsUploading(true);
            setError('');
            setUploadProgress(0);

            // Create a local preview immediately
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload using our proxy service
            const result = await uploadImage(
                file, 
                (progress) => setUploadProgress(progress)
            );

            // Notify parent component
            onImageUploaded(result);

            setUploadProgress(100);
        } catch (error) {
            console.error('Error processing file:', error);
            setError(error instanceof Error ? error.message : 'An unknown error occurred');
            // Keep the preview but show the error
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        processFile(file);
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        resetUpload();
        onImageUploaded({ url: '', publicId: '' });
    };

    // Handle drag and drop
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.add('border-blue-400');
        }
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove('border-blue-400');
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (dropAreaRef.current) {
            dropAreaRef.current.classList.remove('border-blue-400');
        }

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];
            processFile(file);
        }
    }, []);

    return (
        <div className={className}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                Photo
            </label>

            {imagePreview ? (
                <div className="relative mb-4">
                    <img
                        src={imagePreview}
                        alt="Preview"
                        className="h-48 w-full object-cover rounded-md"
                    />
                    <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 p-1 bg-white rounded-full text-gray-500 hover:text-red-500"
                        aria-label="Remove image"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : null}

            <div
                ref={dropAreaRef}
                className={`border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center transition-colors ${error ? 'border-red-300 bg-red-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                aria-label="Drop zone for image upload"
            >
                <div className="space-y-1 text-center">
                    {isUploading ? (
                        <>
                            <Upload className="mx-auto h-12 w-12 text-blue-400 animate-pulse" />
                            <div className="mt-2">
                                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                                        style={{ width: `${uploadProgress}%` }}
                                        role="progressbar" 
                                        aria-valuenow={uploadProgress}
                                        aria-valuemin={0}
                                        aria-valuemax={100}
                                    ></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Camera className={`mx-auto h-12 w-12 ${error ? 'text-red-400' : 'text-gray-400'}`} />
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor="file-upload"
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        id="file-upload"
                                        name="file-upload"
                                        type="file"
                                        className="sr-only"
                                        onChange={handleFileChange}
                                        disabled={isUploading}
                                        accept={accept.join(',')}
                                        ref={fileInputRef}
                                        aria-label="File upload"
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">
                                {accept.map(type => type.split('/')[1].toUpperCase()).join(', ')} up to {maxSize}MB
                            </p>
                            {error && (
                                <p className="text-xs text-red-500 mt-2" role="alert">{error}</p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CloudinaryUpload;