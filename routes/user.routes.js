import express from 'express';
import { getHome } from '../controllers/user_controllers/auth_user.controller.js';
import { isUserAuthenticated } from '../middlewares/auth_middleware.js';
import { fetchCategories } from '../middlewares/fetchCategories.js';
import {
  getProductDetails,
  listProducts,
} from '../controllers/user_controllers/product.controller.js';
import {
  fetchAddress,
  fetchDetails,
} from '../controllers/user_controllers/profile.controller.js';

const router = express.Router();
router.use(fetchCategories);

router.get('', isUserAuthenticated, getHome);
router.get('/products', isUserAuthenticated, listProducts);
router.get('/product/:slug', isUserAuthenticated, getProductDetails);
router.get('/profile', isUserAuthenticated, fetchDetails);
router.get('/profile/address', isUserAuthenticated, fetchAddress);
export default router;
