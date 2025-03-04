import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Ensure environment variables are loaded
dotenv.config();

// Configure Cloudinary with environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

const imageUploadResolver = {
    Mutation: {
        uploadImage: async (_: any, { file }: { file: string }) => {
            try {
                // Check if Cloudinary is properly configured
                if (!process.env.CLOUDINARY_CLOUD_NAME || 
                    !process.env.CLOUDINARY_API_KEY || 
                    !process.env.CLOUDINARY_API_SECRET) {
                    console.error('Missing Cloudinary configuration:', {
                        cloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
                        apiKey: !!process.env.CLOUDINARY_API_KEY,
                        apiSecret: !!process.env.CLOUDINARY_API_SECRET
                    });
                    throw new Error('Missing Cloudinary configuration. Please check your environment variables.');
                }
                
                // Remove the data:image prefix if it exists
                const base64String = file.startsWith('data:') 
                    ? file 
                    : `data:image/png;base64,${file}`; 

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(
                    base64String,
                    {
                        folder: 'newleash_pets',
                        resource_type: 'auto',
                        transformation: [{ width: 1000, crop: 'limit' }]
                    }
                );

                return {
                    url: result.secure_url,
                    publicId: result.public_id
                };
            } catch (error) {
                console.error('Error uploading to Cloudinary:', error);
                throw new Error('Failed to upload image: ' + (error instanceof Error ? error.message : 'Unknown error'));
            }
        },
    }
};

export default imageUploadResolver;