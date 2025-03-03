import { gql } from '@apollo/client';

const UPLOAD_IMAGE = gql`
    mutation UploadImage($file: String!) {
        uploadImage(file: $file) {
        url
        publicId
        }
    }
`;

export const uploadImage = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<{
    url: string;
    publicId: string;
}> => {
    try {
        if (!file) {
            throw new Error('No file provided for upload');
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.');
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            throw new Error('File is too large. Maximum size is 10MB.');
        }

        // Call progress callback at start if provided
        if (onProgress) {
            onProgress(10);
        }

        // Convert file to base64
        const base64String = await fileToBase64(file);

        // Call progress callback after file read
        if (onProgress) {
            onProgress(40);
        }

        // Import the Apollo client from your Apollo context
        // We need to do this dynamically to avoid circular dependencies
        const { ApolloClient, InMemoryCache, HttpLink } = await import('@apollo/client');
        const client = new ApolloClient({
            link: new HttpLink({ uri: '/graphql' }),
            cache: new InMemoryCache()
        });

        // Use Apollo client to make the mutation
        const { data } = await client.mutate({
            mutation: UPLOAD_IMAGE,
            variables: { file: base64String }
        });

        // Call progress callback at completion
        if (onProgress) {
            onProgress(100);
        }

        return {
            url: data.uploadImage.url,
            publicId: data.uploadImage.publicId
        };
    } catch (error) {
        console.error('Error uploading image:', error);
        throw error instanceof Error
            ? error
            : new Error('Unknown error during upload');
    }
};

/**
 * Helper function to convert a file to base64
 */
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};

export const deleteImage = async (publicId: string): Promise<{ success: boolean; message: string }> => {
    try {
        if (!publicId) {
            throw new Error('No public ID provided for deletion');
        }

        // Get auth token if available
        const token = localStorage.getItem('id_token');
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/delete/${encodeURIComponent(publicId)}`, {
            method: 'DELETE',
            headers
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to delete image');
        }

        const result = await response.json();
        return { success: true, message: result.message };
    } catch (error) {
        console.error('Error deleting image:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error during deletion'
        };
    }
};

export const getTransformedUrl = (url: string, options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: number;
}): string => {
    if (!url) return '';

    // Extract parts of the URL
    try {
        const urlObj = new URL(url);
        const pathParts = urlObj.pathname.split('/');

        // Find the upload part
        const uploadIndex = pathParts.findIndex(part => part === 'upload');
        if (uploadIndex === -1) return url;

        // Create transformation string
        const transformations = [];
        if (options.width) transformations.push(`w_${options.width}`);
        if (options.height) transformations.push(`h_${options.height}`);
        if (options.crop) transformations.push(`c_${options.crop}`);
        if (options.quality) transformations.push(`q_${options.quality}`);

        if (transformations.length === 0) return url;

        // Insert transformation string after "upload"
        pathParts.splice(uploadIndex + 1, 0, transformations.join(','));
        urlObj.pathname = pathParts.join('/');

        return urlObj.toString();
    } catch (error) {
        console.error('Error creating transformed URL:', error);
        return url;
    }
};