import express from 'express';
import {
  forgotPasswordHandler,
  getForgotPassword,
  getLogin,
  getResetPassword,
  getSignup,
  getVerifyOTP,
  googleCallback,
  googleLogin,
  LoginHandler,
  resendOTP,
  resetPassword,
  signUpHandler,
  userLogout,
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
router.post('/forgot-password', forgotPasswordHandler);
router.post('/resend-otp', resendOTP);
router.get('/reset-password', getResetPassword);
router.post('/reset-password', resetPassword);
router.get('/logout', userLogout);

// Google OAuth Routes
router.get('/google', googleLogin);
router.get('/google/callback', googleCallback);

export default router;
