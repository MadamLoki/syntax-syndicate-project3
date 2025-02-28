/**
 * Uploads an image file via server proxy
 * @param file The file to upload
 * @param onProgress Optional callback for upload progress
 * @returns Promise containing the upload response with the image URL
 */
export const uploadImage = async (
    file: File,
    onProgress?: (progress: number) => void
): Promise<{
    url: string;
    publicId: string;
}> => {
    return new Promise((resolve, reject) => {
        try {
            if (!file) {
                reject(new Error('No file provided for upload'));
                return;
            }

            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                reject(new Error('Invalid file type. Please upload a JPG, PNG, GIF, or WebP image.'));
                return;
            }

            // Validate file size (10MB limit)
            if (file.size > 10 * 1024 * 1024) {
                reject(new Error('File is too large. Maximum size is 10MB.'));
                return;
            }

            // Create form data for upload
            const formData = new FormData();
            formData.append('file', file);

            // Create and configure XMLHttpRequest for better control
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload');

            // Add auth token if available
            const token = localStorage.getItem('id_token');
            if (token) {
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }

            // Track upload progress
            if (onProgress) {
                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        onProgress(progress);
                    }
                };
            }

            // Handle completion
            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    const response = JSON.parse(xhr.responseText);
                    resolve({
                        url: response.url,
                        publicId: response.publicId,
                    });
                } else {
                    try {
                        const errorData = JSON.parse(xhr.responseText);
                        reject(new Error(errorData.error || `Upload failed with status ${xhr.status}`));
                    } catch (e) {
                        reject(new Error(`Upload failed with status ${xhr.status}`));
                    }
                }
            };

            // Handle network errors
            xhr.onerror = () => {
                reject(new Error('Network error occurred during upload'));
            };

            // Handle timeout
            xhr.ontimeout = () => {
                reject(new Error('Upload timed out'));
            };

            // Set timeout to 60 seconds
            xhr.timeout = 60000;

            // Send the upload request
            xhr.send(formData);
        } catch (error) {
            reject(error);
        }
    });
};

/**
 * Deletes an image from Cloudinary via server proxy
 * @param publicId The public ID of the image to delete
 * @returns Promise with deletion result
 */
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

/**
 * Creates a URL with transformations for an image
 * @param url The original image URL
 * @param options Transformation options
 * @returns The transformed image URL
 */
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