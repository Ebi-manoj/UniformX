import express from 'express';
import { getHome } from '../controllers/user_controllers/auth_user.controller.js';
import { isUserAuthenticated } from '../middlewares/auth_middleware.js';
import { fetchCategories } from '../middlewares/fetchCategories.js';
import {
  getProductDetails,
  listProducts,
} from '../controllers/user_controllers/product.controller.js';
import {
  addAddress,
  changePassword,
  deleteAddress,
  editAddress,
  editProfile,
  fetchAddress,
  fetchDetails,
  getChangePassword,
  uploadProfilePic,
} from '../controllers/user_controllers/profile.controller.js';
import { profileUpload } from '../config/cloudinary.js';
import { addToCart } from '../controllers/user_controllers/cart.controller.js';

const router = express.Router();
router.use(fetchCategories);

router.get('', isUserAuthenticated, getHome);
router.get('/products', isUserAuthenticated, listProducts);
router.get('/product/:slug', isUserAuthenticated, getProductDetails);

// Account Details
router.get('/profile', isUserAuthenticated, fetchDetails);
router.post('/edit-profile', isUserAuthenticated, editProfile);
router.post(
  '/upload-profile',
  isUserAuthenticated,
  profileUpload.single('image'),
  uploadProfilePic
);
router.get('/profile/password', isUserAuthenticated, getChangePassword);
router.post('/profile/change-password', isUserAuthenticated, changePassword);
router.get('/profile/address', isUserAuthenticated, fetchAddress);
router.post('/profile/add-address', isUserAuthenticated, addAddress);
router.post('/profile/update-address', isUserAuthenticated, editAddress);
router.delete('/profile/address/:id', isUserAuthenticated, deleteAddress);

// Cart
router.post('/cart/add', isUserAuthenticated, addToCart);
export default router;
