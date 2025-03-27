import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { Admin } from '../model/admin_model.js';
import { User } from '../model/user_model.js';

// User Auth
export const isUserAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No user token found');
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('User not found');
      return res.redirect('/auth/login');
    }

    next(); // Move to next middleware
  } catch (error) {
    console.log('User token expired, redirecting to login');
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
    res.redirect('/auth/login');
  }
});

// Admin Auth
export const isProtected = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    console.log('no token');
    return res.redirect('login');
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.admin = await Admin.findById(decoded.id).select('-password');
    next();
  } catch (error) {
    console.log('Token expired redirected to login');
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
    res.redirect('login');
  }
});
