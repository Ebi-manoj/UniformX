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
const router = express.Router();

router.get('/login', getLogin);
router.post('/login', adminLogin);
router.get('/dashboard', isProtected, getDashboard);
router.get('/customers', isProtected, getUser);
router.post('/logout', logout);
router.patch('/customers/block/:id', toggleBlock);
export default router;
