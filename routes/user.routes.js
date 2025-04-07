import express from 'express';
import { getHome } from '../controllers/user_controllers/auth_user.controller.js';
import { isUserAuthenticated } from '../middlewares/auth_middleware.js';
import { fetchCartLength, fetchCategories } from '../middlewares/middleware.js';
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
import {
  addToCart,
  getCart,
  removecartItem,
  updateCartQunatity,
} from '../controllers/user_controllers/cart.controller.js';
import {
  cancelOrder,
  getAllOrders,
  getCheckout,
  getOrder,
  getOrderSucces,
  placeOrder,
} from '../controllers/user_controllers/order.controller.js';
import { validateCartForCheckout } from '../middlewares/validatecart.js';
import {
  addToWhishlist,
  fetchWishlist,
} from '../controllers/user_controllers/wishlist.controller.js';

const router = express.Router();
router.use(fetchCategories);

router.get('', isUserAuthenticated, fetchCartLength, getHome);
router.get('/products', isUserAuthenticated, fetchCartLength, listProducts);
router.get(
  '/product/:slug',
  isUserAuthenticated,
  fetchCartLength,
  getProductDetails
);

// Account Details
router.get('/profile', isUserAuthenticated, fetchCartLength, fetchDetails);
router.post('/edit-profile', isUserAuthenticated, editProfile);
router.post(
  '/upload-profile',
  isUserAuthenticated,
  profileUpload.single('image'),
  uploadProfilePic
);
router.get(
  '/profile/password',
  isUserAuthenticated,
  fetchCartLength,
  getChangePassword
);
router.post('/profile/change-password', isUserAuthenticated, changePassword);
router.get(
  '/profile/address',
  isUserAuthenticated,
  fetchCartLength,
  fetchAddress
);
router.post('/profile/add-address', isUserAuthenticated, addAddress);
router.post('/profile/update-address', isUserAuthenticated, editAddress);
router.delete('/profile/address/:id', isUserAuthenticated, deleteAddress);

// Cart
router.get('/cart', isUserAuthenticated, fetchCartLength, getCart);
router.post('/cart/add', isUserAuthenticated, addToCart);
router.post('/cart/update', isUserAuthenticated, updateCartQunatity);
router.delete('/cart/remove-item', isUserAuthenticated, removecartItem);

// Whihslist
router.get('/wishlist', isUserAuthenticated, fetchCartLength, fetchWishlist);
router.post(
  '/add-wishlist',
  isUserAuthenticated,
  fetchCartLength,
  addToWhishlist
);
// order
router.get(
  '/checkout',
  isUserAuthenticated,
  fetchCartLength,
  validateCartForCheckout,
  getCheckout
);
router.post(
  '/place-order',
  isUserAuthenticated,
  fetchCartLength,
  validateCartForCheckout,
  placeOrder
);
router.get(
  '/order-success/:id',
  isUserAuthenticated,
  fetchCartLength,
  getOrderSucces
);
router.get('/orders', isUserAuthenticated, fetchCartLength, getAllOrders);
router.get('/order/:id', isUserAuthenticated, fetchCartLength, getOrder);
router.post(
  '/cancel-order/:orderId',
  isUserAuthenticated,
  fetchCartLength,
  cancelOrder
);

export default router;
