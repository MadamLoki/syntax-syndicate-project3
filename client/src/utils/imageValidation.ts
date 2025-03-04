export interface ImageValidationOptions {
    maxSizeInMB?: number;
    minSizeInKB?: number;
    allowedTypes?: string[];
    maxWidth?: number;
    maxHeight?: number;
    minWidth?: number;
    minHeight?: number;
    aspectRatio?: number; // width/height
}

export interface ImageValidationResult {
    isValid: boolean;
    message: string;
    details?: {
        size?: {
            actual: number;
            max?: number;
            min?: number;
        };
        type?: {
            actual: string;
            allowed: string[];
        };
        dimensions?: {
            width: number;
            height: number;
            maxWidth?: number;
            maxHeight?: number;
            minWidth?: number;
            minHeight?: number;
        };
    };
}

const defaultOptions: ImageValidationOptions = {
    maxSizeInMB: 5,
    minSizeInKB: 1,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxWidth: 4000,
    maxHeight: 4000,
    minWidth: 50,
    minHeight: 50
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            URL.revokeObjectURL(img.src); // Clean up
            resolve({ width: img.width, height: img.height });
        };
        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image'));
        };
        img.src = URL.createObjectURL(file);
    });
};

export const validateImage = async (
    file: File,
    options: ImageValidationOptions = {}
): Promise<ImageValidationResult> => {
    // Merge with default options
    const opts = { ...defaultOptions, ...options };

    // Initialize result
    const result: ImageValidationResult = {
        isValid: true,
        message: 'Image is valid',
        details: {}
    };

    // Validate file size
    const fileSizeInBytes = file.size;
    const fileSizeInKB = fileSizeInBytes / 1024;
    const fileSizeInMB = fileSizeInKB / 1024;

    result.details!.size = {
        actual: fileSizeInBytes,
        max: opts.maxSizeInMB ? opts.maxSizeInMB * 1024 * 1024 : undefined,
        min: opts.minSizeInKB ? opts.minSizeInKB * 1024 : undefined
    };

    if (opts.maxSizeInMB && fileSizeInMB > opts.maxSizeInMB) {
        result.isValid = false;
        result.message = `File size (${formatFileSize(fileSizeInBytes)}) exceeds the maximum allowed size of ${opts.maxSizeInMB} MB`;
        return result;
    }

    if (opts.minSizeInKB && fileSizeInKB < opts.minSizeInKB) {
        result.isValid = false;
        result.message = `File size (${formatFileSize(fileSizeInBytes)}) is below the minimum required size of ${opts.minSizeInKB} KB`;
        return result;
    }

    // Validate file type
    if (opts.allowedTypes && opts.allowedTypes.length > 0) {
        result.details!.type = {
            actual: file.type,
            allowed: opts.allowedTypes
        };

        if (!opts.allowedTypes.includes(file.type)) {
            result.isValid = false;
            result.message = `File type (${file.type}) is not allowed. Accepted types: ${opts.allowedTypes.join(', ')}`;
            return result;
        }
    }

    // Validate image dimensions
    try {
        const dimensions = await getImageDimensions(file);
        const { width, height } = dimensions;

        result.details!.dimensions = {
            width,
            height,
            maxWidth: opts.maxWidth,
            maxHeight: opts.maxHeight,
            minWidth: opts.minWidth,
            minHeight: opts.minHeight
        };

        if (opts.maxWidth && width > opts.maxWidth) {
            result.isValid = false;
            result.message = `Image width (${width}px) exceeds the maximum allowed width of ${opts.maxWidth}px`;
            return result;
        }

        if (opts.maxHeight && height > opts.maxHeight) {
            result.isValid = false;
            result.message = `Image height (${height}px) exceeds the maximum allowed height of ${opts.maxHeight}px`;
            return result;
        }

        if (opts.minWidth && width < opts.minWidth) {
            result.isValid = false;
            result.message = `Image width (${width}px) is below the minimum required width of ${opts.minWidth}px`;
            return result;
        }

        if (opts.minHeight && height < opts.minHeight) {
            result.isValid = false;
            result.message = `Image height (${height}px) is below the minimum required height of ${opts.minHeight}px`;
            return result;
        }

        if (opts.aspectRatio) {
            const actualRatio = width / height;
            const ratioTolerance = 0.1; // 10% tolerance

            if (Math.abs(actualRatio - opts.aspectRatio) > ratioTolerance) {
                result.isValid = false;
                result.message = `Image aspect ratio (${actualRatio.toFixed(2)}) does not match the required ratio of ${opts.aspectRatio}`;
                return result;
            }
        }
    } catch (error) {
        result.isValid = false;
        result.message = 'Failed to validate image dimensions. The file may not be a valid image.';
        return result;
    }

    return result;
};

export const compressImage = async (
    file: File,
    maxSizeInMB: number = 1,
    startQuality: number = 0.8
): Promise<File> => {
    // If the file is already smaller than the max size, return it as is
    if (file.size <= maxSizeInMB * 1024 * 1024) {
        return file;
    }

    // If it's not a compressible image type, return original
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
        return file;
    }

    try {
        const imageBitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            console.error('Failed to get canvas context');
            return file;
        }

        // Set canvas dimensions to match the image
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;

        // Draw the image to the canvas
        ctx.drawImage(imageBitmap, 0, 0);

        // Start with the provided quality
        let quality = startQuality;
        let compressed: Blob;
        let attemptCount = 0;
        const maxAttempts = 5;

        // Try to compress the image with decreasing quality until it's small enough
        do {
            compressed = await new Promise<Blob>((resolve) => {
                canvas.toBlob(
                    (blob) => resolve(blob || new Blob()),
                    file.type,
                    quality
                );
            });

            quality -= 0.1;
            attemptCount++;
        } while (
            compressed.size > maxSizeInMB * 1024 * 1024 &&
            quality > 0.3 &&
            attemptCount < maxAttempts
        );

        // Create a new file from the compressed blob
        return new File([compressed], file.name, {
            type: file.type,
            lastModified: Date.now()
        });
    } catch (error) {
        console.error('Image compression failed:', error);
        return file;
    }
};