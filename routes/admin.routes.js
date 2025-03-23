import express from 'express';
import {
  adminLogin,
  getLogin,
  getDashboard,
  logout,
} from '../controllers/admin_controllers/auth_admin.controller.js';
import { isProtected } from '../middlewares/auth_middleware.js';
import {
  getUser,
  toggleBlock,
} from '../controllers/admin_controllers/user_admin.controller.js';
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategory,
  toggleCategoryStatus,
} from '../controllers/admin_controllers/category_admin.controller.js';
import {
  addClub,
  deleteClub,
  editClub,
  getClubCategory,
  toggleClubStatus,
} from '../controllers/admin_controllers/club_admin.controller.js';
import {
  categoryUpload,
  clubUpload,
  productUpload,
} from '../config/cloudinary.js';
import {
  addProducts,
  getEditProduct,
  getProducts,
  toggleProduct,
  updateProduct,
} from '../controllers/admin_controllers/product_admin.controller.js';
const router = express.Router();

router.get('/login', getLogin);
router.post('/login', adminLogin);
router.get('/dashboard', isProtected, getDashboard);
router.post('/logout', logout);
router.get('/customers', isProtected, getUser);
router.patch('/customers/block/:id', isProtected, toggleBlock);

// Catgeory routes
router.get('/category', isProtected, getCategory);
router.post(
  '/add-category',
  isProtected,
  categoryUpload.single('image'),
  addCategory
);
router.post(
  '/edit-category/:id',
  isProtected,
  categoryUpload.single('image'),
  editCategory
);
router.post('/toggle-category/:id', isProtected, toggleCategoryStatus);
router.delete('/delete-category/:id', isProtected, deleteCategory);

// Club routes
router.get('/club-category', isProtected, getClubCategory);
router.post('/add-club', isProtected, clubUpload.single('image'), addClub);
router.post(
  '/edit-club/:id',
  isProtected,
  clubUpload.single('image'),
  editClub
);
router.post('/toggle-club/:id', isProtected, toggleClubStatus);
router.delete('/delete-club/:id', isProtected, deleteClub);

// Product routes
router.get('/products', isProtected, getProducts);
router.get('/product/:id', isProtected, getEditProduct);
router.post(
  '/add-products',
  isProtected,
  productUpload.array('images', 5),
  addProducts
);
router.post(
  '/product/:id',
  isProtected,
  productUpload.array('images', 5),
  updateProduct
);
router.patch('/toggle-product/:id', isProtected, toggleProduct);
export default router;
