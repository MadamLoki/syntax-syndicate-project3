/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_CLOUDINARY_CLOUD_NAME: string;
    readonly VITE_CLOUDINARY_API_KEY: string;
    readonly VITE_CLOUDINARY_API_SECRET: string;
    // Add other environment variables as needed
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}