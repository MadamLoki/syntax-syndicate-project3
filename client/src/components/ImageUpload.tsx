import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { uploadToCloudinary } from '../utils/CloudinaryService';

interface ImageUploadProps {
    onImageUploaded: (url: string) => void;
    initialImage?: string;
    className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
    onImageUploaded,
    initialImage = '',
    className = ''
}) => {
    const [imagePreview, setImagePreview] = useState<string>(initialImage);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string>('');

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            setUploadError('Invalid file type. Please upload a JPG, PNG, or GIF.');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB
            setUploadError('File is too large. Maximum size is 10MB.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadError('');

            // Create a local preview immediately
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            const imageUrl = await uploadToCloudinary(file);

            // Pass the URL to the parent component
            onImageUploaded(imageUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Failed to upload image. Please try again.');
            setImagePreview('');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        onImageUploaded('');
    };

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
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : null}

            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center">
                <div className="space-y-1 text-center">
                    <Camera className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                        <label
                            htmlFor="file-upload"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500"
                        >
                            <span>{isUploading ? 'Uploading...' : 'Upload a file'}</span>
                            <input
                                id="file-upload"
                                name="file-upload"
                                type="file"
                                className="sr-only"
                                onChange={handleFileChange}
                                disabled={isUploading}
                                accept="image/jpeg,image/png,image/gif"
                            />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    {uploadError && (
                        <p className="text-xs text-red-500">{uploadError}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ImageUpload;