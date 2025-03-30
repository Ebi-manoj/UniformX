import express from 'express';
import { getHome } from '../controllers/user_controllers/auth_user.controller.js';
import { isUserAuthenticated } from '../middlewares/auth_middleware.js';
import {
  getProductDetails,
  listProducts,
} from '../controllers/user_controllers/product.controller.js';

const router = express.Router();

router.get('', isUserAuthenticated, getHome);
router.get('/products', isUserAuthenticated, listProducts);
router.get('/product/:slug', isUserAuthenticated, getProductDetails);

export default router;
