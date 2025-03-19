import express from 'express';
import {
  adminLogin,
  getLogin,
  getDashboard,
  logout,
} from '../controllers/admin_controllers/adminAuth.js';
import { isProtected } from '../middlewares/auth_middleware.js';
import {
  getUser,
  toggleBlock,
} from '../controllers/admin_controllers/userManagement.js';
import {
  addCategory,
  deleteCategory,
  editCategory,
  getCategory,
} from '../controllers/admin_controllers/categoryManagement.js';
import {
  addClub,
  deleteClub,
  editClub,
  getClubCategory,
} from '../controllers/admin_controllers/clubCategory.js';
import { categoryUpload, clubUpload } from '../config/cloudinary.js';
const router = express.Router();

router.get('/login', getLogin);
router.post('/login', adminLogin);
router.get('/dashboard', isProtected, getDashboard);
router.post('/logout', logout);
router.get('/customers', isProtected, getUser);
router.patch('/customers/block/:id', isProtected, toggleBlock);
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
router.patch('/delete-category/:id', isProtected, deleteCategory);
router.get('/club-category', isProtected, getClubCategory);
router.post('/add-club', isProtected, clubUpload.single('image'), addClub);
router.post(
  '/edit-club/:id',
  isProtected,
  clubUpload.single('image'),
  editClub
);
router.patch('/delete-club/:id', isProtected, deleteClub);
export default router;
