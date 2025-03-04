export interface CompressionOptions {
    targetSizeInMB?: number;      // Target file size in MB
    maxWidth?: number;            // Maximum width of the image
    maxHeight?: number;           // Maximum height of the image 
    initialQuality?: number;      // Initial compression quality (0-1)
    minQuality?: number;          // Minimum acceptable quality (0-1)
    outputFormat?: string;        // 'jpeg', 'png', 'webp'
    preserveTransparency?: boolean; // Preserve transparency (for PNG)
    onProgress?: (progress: number) => void; // Progress callback
}

export interface CompressionResult {
    success: boolean;
    file: File;
    originalSize: number;
    compressedSize: number;
    compressionRatio: number;
    width: number;
    height: number;
    quality: number;
    format: string;
    message: string;
}

const defaultOptions: CompressionOptions = {
    targetSizeInMB: 2,
    maxWidth: 1920,
    maxHeight: 1080,
    initialQuality: 0.8,
    minQuality: 0.5,
    outputFormat: 'same', // 'same' = keep original format
    preserveTransparency: true,
    onProgress: undefined,
};

export const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
};

const calculateScalingDimensions = (
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
): { width: number; height: number } => {
    let targetWidth = originalWidth;
    let targetHeight = originalHeight;

    // Scale down if needed
    if (targetWidth > maxWidth) {
        const scale = maxWidth / targetWidth;
        targetWidth = maxWidth;
        targetHeight = Math.floor(targetHeight * scale);
    }

    if (targetHeight > maxHeight) {
        const scale = maxHeight / targetHeight;
        targetHeight = maxHeight;
        targetWidth = Math.floor(targetWidth * scale);
    }

    return { width: targetWidth, height: targetHeight };
};

const determineOutputType = (originalType: string, outputFormat: string): string => {
    if (outputFormat === 'same') {
        return originalType;
    }

    switch (outputFormat) {
        case 'jpeg':
        case 'jpg':
            return 'image/jpeg';
        case 'png':
            return 'image/png';
        case 'webp':
            return 'image/webp';
        default:
            return originalType;
    }
};

export const compressImage = async (
    file: File,
    options: CompressionOptions = {}
): Promise<CompressionResult> => {
    // Merge with default options
    const opts = { ...defaultOptions, ...options };

    // Set up result object
    const result: CompressionResult = {
        success: false,
        file: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        width: 0,
        height: 0,
        quality: opts.initialQuality || 0.8,
        format: file.type,
        message: 'No compression performed',
    };

    // If file is already smaller than target, return original
    if (opts.targetSizeInMB && file.size <= opts.targetSizeInMB * 1024 * 1024) {
        result.success = true;
        result.message = 'File already smaller than target size';
        if (opts.onProgress) opts.onProgress(100);
        return result;
    }

    // Check if file is a compressible image
    const compressibleTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!compressibleTypes.includes(file.type)) {
        result.message = `Cannot compress file type: ${file.type}`;
        if (opts.onProgress) opts.onProgress(100);
        return result;
    }

    try {
        if (opts.onProgress) opts.onProgress(10);

        // Create a bitmap from the file
        const imageBitmap = await createImageBitmap(file);
        result.width = imageBitmap.width;
        result.height = imageBitmap.height;

        if (opts.onProgress) opts.onProgress(20);

        // Calculate scaling dimensions if needed
        const dimensions = calculateScalingDimensions(
            imageBitmap.width,
            imageBitmap.height,
            opts.maxWidth || 1920,
            opts.maxHeight || 1080
        );

        // Only resize if dimensions are different
        const needsResize = dimensions.width !== imageBitmap.width || dimensions.height !== imageBitmap.height;

        // Create canvas and context
        const canvas = document.createElement('canvas');
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;
        const ctx = canvas.getContext('2d', {
            alpha: opts.preserveTransparency
        });

        if (!ctx) {
            result.message = 'Failed to get canvas context';
            if (opts.onProgress) opts.onProgress(100);
            return result;
        }

        // Draw image to canvas (resizing if needed)
        ctx.drawImage(imageBitmap, 0, 0, dimensions.width, dimensions.height);

        if (opts.onProgress) opts.onProgress(40);

        // Determine output type
        const outputType = determineOutputType(file.type, opts.outputFormat || 'same');
        result.format = outputType;

        // Try compression with decreasing quality until target size is reached
        let quality = opts.initialQuality || 0.8;
        const minQuality = opts.minQuality || 0.5;
        const targetSize = opts.targetSizeInMB ? opts.targetSizeInMB * 1024 * 1024 : Infinity;
        const maxAttempts = 5;
        let attemptCount = 0;
        let lastBlob: Blob | null = null;

        while (attemptCount < maxAttempts) {
            attemptCount++;

            // Progress update based on attempt
            if (opts.onProgress) {
                const progressBase = 40;
                const progressStep = (90 - progressBase) / maxAttempts;
                opts.onProgress(progressBase + attemptCount * progressStep);
            }

            // Create blob with current quality
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(
                    (b) => resolve(b),
                    outputType,
                    quality
                );
            });

            if (!blob) {
                continue;
            }

            lastBlob = blob;

            // If we've reached target size or minimum quality, stop
            if (blob.size <= targetSize || quality <= minQuality) {
                break;
            }

            // Reduce quality for next attempt
            // More aggressive reduction as we get closer to min quality
            const reduction = 0.1 + (0.1 * (1 - ((quality - minQuality) / (opts.initialQuality || 0.8 - minQuality))));
            quality = Math.max(minQuality, quality - reduction);
        }

        if (!lastBlob) {
            result.message = 'Compression failed - could not generate blob';
            if (opts.onProgress) opts.onProgress(100);
            return result;
        }

        // Create new file from the compressed blob
        const fileName = file.name.split('.')[0];
        const extension = outputType.split('/')[1];
        const compressedFile = new File(
            [lastBlob],
            `${fileName}.${extension}`,
            { type: outputType, lastModified: Date.now() }
        );

        // Update result object
        result.success = true;
        result.file = compressedFile;
        result.compressedSize = compressedFile.size;
        result.compressionRatio = file.size / compressedFile.size;
        result.quality = quality;
        result.width = dimensions.width;
        result.height = dimensions.height;

        // Create appropriate message
        if (needsResize) {
            result.message = `Compressed and resized from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)} (${Math.round(100 / result.compressionRatio)}% of original)`;
        } else {
            result.message = `Compressed from ${formatFileSize(file.size)} to ${formatFileSize(compressedFile.size)} (${Math.round(100 / result.compressionRatio)}% of original)`;
        }

        if (opts.onProgress) opts.onProgress(100);
        return result;
    } catch (error) {
        console.error('Image compression failed:', error);
        result.message = `Compression error: ${error instanceof Error ? error.message : 'Unknown error'}`;
        if (opts.onProgress) opts.onProgress(100);
        return result;
    }
};

export const autoCompressImage = async (
    file: File,
    options: CompressionOptions = {}
): Promise<File> => {
    const threshold = options.targetSizeInMB || 2;

    // If file is already below threshold, return as is
    if (file.size <= threshold * 1024 * 1024) {
        return file;
    }

    try {
        const result = await compressImage(file, options);
        if (result.success) {
            return result.file;
        }
        return file;
    } catch (error) {
        console.error('Auto-compression failed:', error);
        return file;
    }
};