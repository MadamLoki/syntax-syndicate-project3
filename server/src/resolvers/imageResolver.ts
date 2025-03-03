import { v2 as cloudinary } from 'cloudinary';

const imageUploadResolver = {
    Mutation: {
        uploadImage: async (_: any, { file }: { file: string }) => {
            try {
                // Remove the data:image prefix
                const base64Data = file.replace(/^data:image\/\w+;base64,/, '');

                // Upload to Cloudinary
                const result = await cloudinary.uploader.upload(
                    `data:image/png;base64,${base64Data}`,
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
                throw new Error('Failed to upload image');
            }
        },
    }
};

export default imageUploadResolver;