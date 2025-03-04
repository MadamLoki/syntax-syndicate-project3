import React, { useState, useRef } from 'react';
import { Camera, X } from 'lucide-react';
import { useImageUpload } from '../utils/CloudinaryService'; // Use consistent import

interface ProfilePictureProps {
    initialImage?: string;
    username?: string;
    onImageUploaded: (url: string) => void;
    editable?: boolean;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
    initialImage,
    username,
    onImageUploaded,
    editable = false
}) => {
    const [image, setImage] = useState<string | undefined>(initialImage);
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Using our CloudinaryService hook
    const { uploadImage } = useImageUpload();

    // Get first letter of username for placeholder
    const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        try {
            setIsUploading(true);
            const result = await uploadImage(file);
    
            // Update state with the new image URL
            setImage(result.url);
    
            // Call parent's callback with new URL
            onImageUploaded(result.url);
    
            // Close the edit mode
            setIsEditing(false);
        } catch (error) {
            console.error('Error uploading profile picture:', error);
            // Add error handling here
        } finally {
            setIsUploading(false);
        }
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    // If we're not in edit mode, just display the profile picture
    if (!isEditing) {
        return (
            <div className="relative group">
                <div className="h-20 w-20 rounded-full overflow-hidden">
                    {image ? (
                        <img src={image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {firstLetter}
                        </div>
                    )}
                </div>

                {/* Only show edit button if editable prop is true */}
                {editable && (
                    <button
                        onClick={handleEditClick}
                        className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Edit profile picture"
                    >
                        <Camera className="w-4 h-4" />
                    </button>
                )}
            </div>
        );
    }

    // Edit mode UI
    return (
        <div className="bg-white rounded-lg p-4 shadow-md">
            <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold">Update Profile Picture</h3>
                <button onClick={handleCancelEdit} className="text-gray-500 hover:text-gray-700">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Current picture or placeholder */}
            <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full overflow-hidden">
                    {image ? (
                        <img src={image} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                            {firstLetter}
                        </div>
                    )}
                </div>
            </div>

            {/* Upload controls */}
            <div>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/jpeg,image/png,image/gif,image/webp"
                />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                >
                    {isUploading ? 'Uploading...' : 'Choose Image'}
                </button>
            </div>
        </div>
    );
};

export default ProfilePicture;