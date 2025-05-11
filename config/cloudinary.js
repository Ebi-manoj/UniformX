import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, or WEBP image files are allowed'));
  }
};

// Limit file size to 2MB
const limits = {
  fileSize: 2 * 1024 * 1024,
};

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
    transformation: [{ width: 720, height: 720, crop: 'fill' }],
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

//For Profile upload
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uniformx/profiles',
    format: async (req, file) => 'webp',
    transformation: [
      { width: 300, height: 300, crop: 'fill', gravity: 'face' },
    ], // Crop around the face
  },
});

// Create multer instances
export const categoryUpload = multer({
  storage: categoryStorage,
  fileFilter,
  limits,
});
export const productUpload = multer({
  storage: productStorage,
  fileFilter,
  limits,
});
export const clubUpload = multer({ storage: clubStorage, fileFilter, limits });
export const profileUpload = multer({
  storage: profileStorage,
  fileFilter,
  limits,
});
export { cloudinary };
