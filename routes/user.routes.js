import express from 'express';
import {
  getAbout,
  getContact,
  getHome,
} from '../controllers/user_controllers/auth_user.controller.js';
import {
  attachUserIfAuthenticated,
  isUserAuthenticated,
} from '../middlewares/auth_middleware.js';
import { fetchCartLength, fetchCategories } from '../middlewares/middleware.js';
import {
  addReview,
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
  downloadInvoice,
  getAllOrders,
  getCheckout,
  getOrder,
  getOrderFailure,
  getOrderSucces,
  placeOrder,
  returnOrder,
} from '../controllers/user_controllers/order.controller.js';
import { validateCartForCheckout } from '../middlewares/validatecart.js';
import {
  addToWhishlist,
  fetchWishlist,
  removeWishlist,
} from '../controllers/user_controllers/wishlist.controller.js';
import { getWallet } from '../controllers/user_controllers/wallet.controller.js';
import {
  applyCoupon,
  fetchAllCoupons,
  removeCoupon,
} from '../controllers/user_controllers/coupon.controller.js';
import {
  createProductOrder,
  createWalletOrder,
  retryPayment,
  verifyPayment,
} from '../controllers/user_controllers/payment.controller.js';
import {
  applyReferal,
  getReferal,
} from '../controllers/user_controllers/referal.controller.js';

const router = express.Router();
router.use(fetchCategories);
router.use(attachUserIfAuthenticated);
// About and contact
router.get('/about', fetchCartLength, getAbout);
router.get('/contact', fetchCartLength, getContact);

router.get('', fetchCartLength, getHome);
router.get('/products', fetchCartLength, listProducts);
router.get('/product/:slug', fetchCartLength, getProductDetails);

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

// Wishlist
router.get('/wishlist', isUserAuthenticated, fetchCartLength, fetchWishlist);
router.post('/add-wishlist', isUserAuthenticated, addToWhishlist);
router.patch('/remove-wishlist', isUserAuthenticated, removeWishlist);
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
router.get(
  '/order-failure/:orderId',
  isUserAuthenticated,
  fetchCartLength,
  getOrderFailure
);
router.get('/orders', isUserAuthenticated, fetchCartLength, getAllOrders);
router.get('/order/:id', isUserAuthenticated, fetchCartLength, getOrder);
router.post('/cancel-order/:orderId', isUserAuthenticated, cancelOrder);
router.put('/return-order/:orderId', isUserAuthenticated, returnOrder);
router.get(
  '/order/:orderId/invoice',
  isUserAuthenticated,
  fetchCartLength,
  downloadInvoice
);

// review
router.post('/add-review/:productId', isUserAuthenticated, addReview);

// wallet
router.get('/wallet', isUserAuthenticated, fetchCartLength, getWallet);

// coupon
router.get('/coupons', isUserAuthenticated, fetchAllCoupons);
router.post('/coupon/apply', isUserAuthenticated, applyCoupon);
router.patch('/coupon/remove', isUserAuthenticated, removeCoupon);

// payments
router.post('/wallet/create-order', isUserAuthenticated, createWalletOrder);
router.post('/order/create-order', isUserAuthenticated, createProductOrder);
router.post('/verify-payment', isUserAuthenticated, verifyPayment);
router.get('/retry-payment/:orderId', isUserAuthenticated, retryPayment);

// referals
router.get('/referal', isUserAuthenticated, fetchCartLength, getReferal);
router.put('/referal/apply/:referalToken', isUserAuthenticated, applyReferal);
export default router;
