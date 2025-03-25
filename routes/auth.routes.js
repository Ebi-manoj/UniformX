import express from 'express';
import {
  getForgotPassword,
  getLogin,
  getSignup,
  getVerifyOTP,
  LoginHandler,
  resendOTP,
  signUpHandler,
  verifyOTP,
} from '../controllers/user_controllers/auth_user.controller.js';

const router = express.Router();

router.get('/signup', getSignup);
router.get('/login', getLogin);
router.post('/login', LoginHandler);
router.post('/signup', signUpHandler);
router.get('/verify-otp', getVerifyOTP);
router.post('/verify-otp', verifyOTP);
router.get('/forgot-password', getForgotPassword);
router.post('/resend-otp', resendOTP);

export default router;
