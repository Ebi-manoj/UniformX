import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// For category images
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniformx/categories',
    format: async (req, file) => 'webp',
    transformation: [{ width: 500, crop: 'limit' }],
  },
});
const clubStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniformx/clubs',
    format: async (req, file) => 'webp',
    transformation: [{ width: 500, crop: 'limit' }],
  },
});

// For product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniformx/products',
    format: async (req, file) => 'webp',
    transformation: [{ width: 800, crop: 'limit' }],
  },
});

// Create multer instances
export const categoryUpload = multer({ storage: categoryStorage });
export const productUpload = multer({ storage: productStorage });
export const clubUpload = multer({ storage: clubStorage });
export { cloudinary };
