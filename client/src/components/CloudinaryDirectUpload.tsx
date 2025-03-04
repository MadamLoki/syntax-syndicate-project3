
import React, { useState, useCallback, useRef } from 'react';
import { Camera, X, Upload } from 'lucide-react';

interface CloudinaryDirectUploadProps {
    onImageUploaded: (url: string) => void;
    initialImage?: string;
    className?: string;
    folder?: string;
}

const CloudinaryDirectUpload: React.FC<CloudinaryDirectUploadProps> = ({
    onImageUploaded,
    initialImage = '',
    className = '',
    folder = 'newleash_pets',
}) => {
    const [imagePreview, setImagePreview] = useState<string>(initialImage);
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadError, setUploadError] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropAreaRef = useRef<HTMLDivElement>(null);

    const uploadToCloudinary = async (file: File) => {
        try {
            setIsUploading(true);
            setUploadProgress(0);
            setUploadError('');

            // Create form data
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'newleash_uploads'); // Use an unsigned upload preset
            if (folder) {
                formData.append('folder', folder);
            }

            // Create a local preview immediately
            const reader = new FileReader();
            reader.onload = (event) => {
                setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);

            // Upload to Cloudinary
            const xhr = new XMLHttpRequest();
            const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            // Track upload progress
            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    setUploadProgress(progress);
                }
            };

            // Handle response
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    onImageUploaded(response.secure_url);
                    setIsUploading(false);
                    setUploadProgress(100);
                } else {
                    console.error('Upload failed:', xhr.statusText);
                    setUploadError('Upload failed. Please try again.');
                    setIsUploading(false);
                    setUploadProgress(0);
                }
            };

            // Handle errors
            xhr.onerror = () => {
                console.error('XHR error');
                setUploadError('Network error. Please try again.');
                setIsUploading(false);
                setUploadProgress(0);
            };

            // Send the upload
            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Failed to upload image. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

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

        // Upload the file
        await uploadToCloudinary(file);
    };

    const handleRemoveImage = () => {
        setImagePreview('');
        setUploadProgress(0);
        onImageUploaded('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
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

            // Upload the file
            uploadToCloudinary(file);
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
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : null}

            <div
                ref={dropAreaRef}
                className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center transition-colors"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
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
                                    ></div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <Camera className="mx-auto h-12 w-12 text-gray-400" />
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
                                        accept="image/jpeg,image/png,image/gif"
                                        ref={fileInputRef}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                        </>
                    )}
                    {uploadError && (
                        <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CloudinaryDirectUpload;