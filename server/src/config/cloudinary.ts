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
 * Uploads an image to Cloudinary
 * @param imagePath Path to the image file or base64 encoded image
 * @param folder Optional folder in Cloudinary to store the image
 * @returns Promise with upload result including secure_url
 */
export const uploadImage = async (imagePath: string, folder = 'newleash') => {
    try {
        const result = await cloudinary.uploader.upload(imagePath, {
            folder,
            resource_type: 'auto',
            // You can add transformation options here if needed
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
        throw new Error('Failed to upload image');
    }
};

/**
 * Deletes an image from Cloudinary
 * @param publicId The public ID of the image to delete
 * @returns Promise with deletion result
 */
export const deleteImage = async (publicId: string) => {
    try {
        return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
};

export default cloudinary;