import React, { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { useMutation } from '@apollo/client';
import { UPDATE_PROFILE_IMAGE } from '../utils/mutations';
import { compressImage } from '../utils/imageCompression';
import { validateImage } from '../utils/imageValidation';

interface ProfilePictureProps {
    currentImageUrl?: string;
    username: string;
    onImageUpdated: (newImageUrl: string) => void;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
    currentImageUrl,
    username,
    onImageUpdated
}) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(currentImageUrl || null);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [isCompressing, setIsCompressing] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [message, setMessage] = useState<{ text: string; type: string }>({ text: '', type: '' });
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const [updateProfileImage, { loading }] = useMutation(UPDATE_PROFILE_IMAGE, {
        onCompleted: (data) => {
            if (data?.updateProfileImage?.profileImageUrl) {
                onImageUpdated(data.updateProfileImage.profileImageUrl);
                setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
                setTimeout(() => setMessage({ text: '', type: '' }), 3000);
            }
        },
        onError: (error) => {
            setMessage({ text: `Error: ${error.message}`, type: 'error' });
        }
    });

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            try {
                // Validate the image
                const validationResult = await validateImage(file, {
                    maxSizeInMB: 5,
                    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                    maxWidth: 2000,
                    maxHeight: 2000,
                });

                if (!validationResult.isValid) {
                    setMessage({ text: validationResult.message, type: 'error' });
                    return;
                }

                // Create a preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImagePreview(e.target?.result as string);
                };
                reader.readAsDataURL(file);

                // Check if compression is needed
                if (file.size > 1024 * 1024) { // > 1MB
                    setIsCompressing(true);
                    setMessage({ text: 'Optimizing image...', type: '' });

                    const compressedImage = await compressImage(file, {
                        targetSizeInMB: 0.5,
                        maxWidth: 512,
                        maxHeight: 512,
                        initialQuality: 0.8,
                        onProgress: (progress) => setUploadProgress(progress)
                    });

                    setImageFile(compressedImage.file);
                    setIsCompressing(false);
                    setMessage({ text: 'Image optimized and ready to upload', type: 'success' });
                } else {
                    setImageFile(file);
                }
            } catch (error) {
                console.error('Error processing image:', error);
                setMessage({
                    text: `Error processing image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                    type: 'error'
                });
            }
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const file = e.dataTransfer.files[0];

            // Create a synthetic change event
            const mockEvent = {
                target: {
                    files: e.dataTransfer.files
                }
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            handleImageChange(mockEvent);
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        setImagePreview(null);
        // If there was a previous image and it's removed, send null to API
        if (currentImageUrl) {
            updateProfileImage({
                variables: { imageUrl: '' }
            });
        }
    };

    const handleUpload = async () => {
        if (!imageFile) return;

        try {
            setIsUploading(true);
            setMessage({ text: 'Uploading profile picture...', type: '' });

            // Import the CloudinaryService uploader
            const { uploadImage } = await import('../utils/CloudinaryService');
            const result = await uploadImage(
                imageFile,
                (progress) => setUploadProgress(progress)
            );

            // Get the image URL from the result
            const imageUrl = result.url;

            // Update profile with new image URL
            await updateProfileImage({
                variables: { imageUrl }
            });

            setIsUploading(false);
            setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
        } catch (error) {
            console.error('Error uploading image:', error);
            setIsUploading(false);
            setMessage({
                text: `Error uploading image: ${error instanceof Error ? error.message : 'Unknown error'}`,
                type: 'error'
            });
        }
    };

    return (
        <div className="mb-6">
            {message.text && (
                <div
                    className={`p-3 mb-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
                            message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' :
                                'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                >
                    {message.text}
                </div>
            )}

            <div className="flex flex-col items-center">
                {/* Profile Image Preview */}
                {imagePreview ? (
                    <div className="relative mb-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden border-4 border-white shadow-md">
                            <img
                                src={imagePreview}
                                alt={`${username}'s profile`}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-md text-gray-600 hover:text-red-500 transition-colors"
                            aria-label="Remove image"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="h-32 w-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mb-4 overflow-hidden">
                        <span className="text-3xl font-bold">{username ? username.charAt(0).toUpperCase() : '?'}</span>
                    </div>
                )}

                {/* Upload Progress */}
                {isCompressing && (
                    <div className="w-full max-w-xs bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-blue-700">Processing image...</span>
                            <span className="text-sm text-blue-700">{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Upload Area or Button */}
                {!imagePreview ? (
                    <div
                        className={`border-2 border-dashed rounded-lg p-4 w-full max-w-xs transition-colors ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
                            }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(true);
                        }}
                        onDragLeave={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsDragging(false);
                        }}
                        onDrop={handleDrop}
                    >
                        <div className="flex flex-col items-center">
                            <Camera className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 mb-2">Upload a profile picture</p>
                            <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                                <span>Select Image</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleImageChange}
                                    accept="image/jpeg,image/png,image/webp"
                                />
                            </label>
                            <p className="text-xs text-gray-500 mt-2">JPG, PNG, or WebP (max. 5MB)</p>
                        </div>
                    </div>
                ) : imageFile ? (
                    <button
                        onClick={handleUpload}
                        disabled={isUploading || loading}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                    >
                        {isUploading || loading ? 'Uploading...' : 'Save Profile Picture'}
                    </button>
                ) : null}
            </div>
        </div>
    );
};

export default ProfilePicture;