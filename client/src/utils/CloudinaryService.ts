// client/src/utils/CloudinaryService.ts

/**
 * Uploads an image file to Cloudinary and returns the secure URL
 * @param file The file to upload
 * @returns Promise containing the secure URL of the uploaded image
 */
export const uploadToCloudinary = async (file: File): Promise<string> => {
    try {
        // Check if Cloudinary environment variables are configured
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

        if (!cloudName) {
            throw new Error('VITE_CLOUDINARY_CLOUD_NAME is not configured in environment variables');
        }

        // Create a FormData object to send the file
        const formData = new FormData();
        formData.append('file', file);

        // You would typically create an upload preset in your Cloudinary dashboard
        // that defines permissions, transformations, and folder destinations
        formData.append('upload_preset', 'newleash_uploads');

        // Send directly to Cloudinary API
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Cloudinary error response:', errorData);
            throw new Error(errorData.error?.message || `Upload failed with status: ${response.status}`);
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw error;
    }
};

/**
 * Creates a Cloudinary URL with transformations
 * @param publicId The public ID of the image
 * @param options Transformation options
 * @returns The transformed image URL
 */
export const getCloudinaryUrl = (publicId: string, options: { width?: number; height?: number; crop?: string } = {}) => {
    if (!publicId) return '';

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
        console.error('VITE_CLOUDINARY_CLOUD_NAME is not configured in environment variables');
        return publicId; // Return the original ID if cloud name is missing
    }

    // Extract just the publicId part if it's a full URL
    const id = publicId.includes('upload')
        ? publicId.split('upload/').pop()
        : publicId;

    const transformations = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.crop) transformations.push(`c_${options.crop}`);

    const transformationString = transformations.length > 0
        ? transformations.join(',') + '/'
        : '';

    return `https://res.cloudinary.com/${cloudName}/image/upload/${transformationString}${id}`;
};