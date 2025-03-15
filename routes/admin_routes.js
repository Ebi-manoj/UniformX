import express from 'express';
import {
  adminLogin,
  getLogin,
  getDashboard,
} from '../controllers/admin_controllers/adminAuth.js';
import { isProtected } from '../middlewares/auth_middleware.js';
import { getUser } from '../controllers/admin_controllers/userManagement.js';
const router = express.Router();

router.get('/login', getLogin);
router.post('/login', adminLogin);
router.get('/dashboard', isProtected, getDashboard);
router.get('/users', isProtected, getUser);
export default router;
