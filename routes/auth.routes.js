import express from 'express';
import {
  getLogin,
  getSignup,
  getVerifyOTP,
  signUpHandler,
  verifyOTP,
} from '../controllers/user_controllers/auth_user.controller.js';

const router = express.Router();

router.get('/signup', getSignup);
router.get('/login', getLogin);
router.post('/signup', signUpHandler);
router.get('/verify-otp', getVerifyOTP);
router.post('/verify-otp', verifyOTP);
export default router;
