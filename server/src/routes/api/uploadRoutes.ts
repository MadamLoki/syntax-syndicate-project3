// server/src/routes/api/uploadRoutes.ts
import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
import { AuthenticationError } from '../../utils/auth.js';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// Define storage parameters for Cloudinary
const storageOptions = {
    cloudinary: cloudinary,
    params: {
        folder: 'newleash_pets',
        allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'webp'],
        transformation: [{ width: 1000, crop: 'limit' }]
    }
};

// Create storage with type assertion
const storage = new CloudinaryStorage(storageOptions) as unknown as multer.StorageEngine;

// Configure upload middleware
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    }
});

// Error handler middleware for multer errors
const handleMulterError = (err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        }
        return res.status(400).json({ error: err.message });
    } else if (err) {
        // For other errors
        return res.status(400).json({ error: err.message || 'Upload error' });
    }
    // If no error, continue
    next();
};

// Authentication middleware
const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
    // Check if authenticated
    if (!req.user) {
        res.status(401).json({ error: 'You need to be logged in to upload files' });
    } else {
        next();
    }
};

// Upload route
router.post('/upload', checkAuth, (req: Request, res: Response, next: NextFunction) => {
    // Use multer middleware
    // upload.single('file')(req, res, (err) => {
    //     if (err) {
    //         return handleMulterError(err, req, res, next);
    //     }

    //     // Get the uploaded file from request
    //     const file = req.file;

    //     if (!file) {
    //         return res.status(400).json({ error: 'No file uploaded' });
    //     } else if (!file.mimetype.startsWith('image/')) {
    //         return res.status(400).json({ error: 'Only image files are allowed' });
    //     } else {
    //         try {
    //             // Extract the public ID from the path
    //             // The format is usually: https://res.cloudinary.com/cloud_name/image/upload/v1234567890/folder/filename
    //             const url = file.path || '';
    //             const parts = url.split('/');
    //             const filename = parts[parts.length - 1];
    //             const folder = parts[parts.length - 2];
    //             const publicId = `${folder}/${filename.split('.')[0]}`;

    //             // Return the Cloudinary response with available properties
    //             return res.status(200).json({
    //                 url: file.path, // Cloudinary URL
    //                 publicId: publicId,
    //                 format: file.mimetype ? file.mimetype.split('/')[1] : 'unknown'
    //             });
    //         } catch (error) {
    //             console.error('Error processing upload result:', error);
    //             return res.status(500).json({ error: 'Error processing upload' });
    //         }
    //     }
    // });
});

// Deletion endpoint
router.delete('/delete/:publicId', checkAuth, async (req: Request, res: Response): Promise<void> => {
    const { publicId } = req.params;

    if (!publicId) {
        res.status(400).json({ error: 'No public ID provided' });
        return;
    }

    try {
        // Delete the image from Cloudinary
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            res.status(200).json({ message: 'File deleted successfully' });
        } else {
            res.status(400).json({ error: 'Failed to delete file', details: result });
        }
    } catch (error) {
        console.error('Delete operation error:', error);
        res.status(500).json({ error: 'Server error during deletion' });
    }
});

export default router;