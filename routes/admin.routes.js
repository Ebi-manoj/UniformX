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
} from '../controllers/admin_controllers/club_admin.controller.js';
import { categoryUpload, clubUpload } from '../config/cloudinary.js';
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
router.delete('/delete-club/:id', isProtected, deleteClub);

export default router;
