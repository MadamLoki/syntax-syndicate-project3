import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

/**
 * Extract public ID from Cloudinary URL
 * @param url Full Cloudinary URL
 * @param folder Optional folder name to include in the public ID
 * @returns The public ID for Cloudinary operations
 */
export const extractPublicId = (url: string, folder?: string): string => {
    try {
        if (!url) return '';
        
        // For URLs in format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/image_id.jpg
        const regex = /\/v\d+\/(.+)$/;
        const match = url.match(regex);
        
        if (match && match[1]) {
            // Remove file extension if present
            const publicIdWithExt = match[1];
            const publicId = publicIdWithExt.split('.')[0];
            return publicId;
        }
        
        // Fallback: try to extract between upload/ and extension
        const uploadIndex = url.indexOf('upload/');
        if (uploadIndex !== -1) {
            const afterUpload = url.substring(uploadIndex + 7);
            const publicId = afterUpload.split('.')[0];
            return publicId;
        }
        
        return '';
    } catch (error) {
        console.error('Error extracting public ID:', error);
        return '';
    }
};

/**
 * Uploads an image to Cloudinary
 * @param imagePath Path to the image file or base64 encoded image
 * @param folder Optional folder in Cloudinary to store the image
 * @returns Promise with upload result including secure_url and public_id
 */
export const uploadImage = async (imagePath: string, folder = 'newleash') => {
    try {
        if (!imagePath) {
            throw new Error('No image provided for upload');
        }

        const result = await cloudinary.uploader.upload(imagePath, {
            folder,
            resource_type: 'auto',
            transformation: [
                { width: 1000, crop: 'limit' } // Limit max width to 1000px
            ]
        });

        return {
            publicId: result.public_id,
            url: result.secure_url,
            format: result.format,
            width: result.width,
            height: result.height
        };
    } catch (error) {
        console.error('Error uploading image to Cloudinary:', error);
        throw new Error('Failed to upload image to Cloudinary');
    }
};

/**
 * Deletes an image from Cloudinary
 * @param publicIdOrUrl The public ID or full URL of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (publicIdOrUrl: string) => {
    try {
        if (!publicIdOrUrl) {
            console.warn('No public ID or URL provided for deletion');
            return { result: 'not_deleted', reason: 'no_public_id' };
        }

        // If a full URL was provided, extract the public ID
        const publicId = publicIdOrUrl.includes('cloudinary.com') 
            ? extractPublicId(publicIdOrUrl)
            : publicIdOrUrl;
            
        if (!publicId) {
            console.warn('Could not extract a valid public ID from:', publicIdOrUrl);
            return { result: 'not_deleted', reason: 'invalid_public_id' };
        }

        const result = await cloudinary.uploader.destroy(publicId);
        return result;
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image from Cloudinary');
    }
};

/**
 * Creates a Cloudinary URL with transformations
 * @param publicIdOrUrl The public ID or URL of the image
 * @param options Transformation options
 * @returns The transformed image URL
 */
export const getTransformedUrl = (publicIdOrUrl: string, options: { 
    width?: number; 
    height?: number; 
    crop?: string;
    quality?: number;
    format?: string;
} = {}) => {
    try {
        if (!publicIdOrUrl) return '';

        // Extract public ID if a full URL was provided
        const publicId = publicIdOrUrl.includes('cloudinary.com')
            ? extractPublicId(publicIdOrUrl)
            : publicIdOrUrl;

        if (!publicId) return publicIdOrUrl; // Return original if extraction failed

        const transformations = [];

        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
        if (options.crop) transformations.push(`c_${options.crop}`);
        if (options.quality) transformations.push(`q_${options.quality}`);
        if (options.format) transformations.push(`f_${options.format}`);

        const transformationString = transformations.length > 0
            ? transformations.join(',') + '/'
            : '';

        return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/${transformationString}${publicId}`;
    } catch (error) {
        console.error('Error creating transformed URL:', error);
        return publicIdOrUrl; // Return original on error
    }
};

export default cloudinary;