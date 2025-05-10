import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { Admin } from '../model/admin_model.js';
import { User } from '../model/user_model.js';

// User Auth
export const isUserAuthenticated = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    console.log('No user token found');
    if (req.xhr || req.headers.accept.includes('application/json')) {
      console.log('json redirect');

      return res.status(401).json({ success: false, redirect: '/auth/login' });
    }
    console.log('redirect');

    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.user = await User.findOne({
      _id: decoded.id,
      is_blocked: false,
    }).select('-password');

    if (!req.user) {
      res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
      console.log('User not found');
      if (req.xhr || req.headers.accept.includes('application/json')) {
        return res
          .status(401)
          .json({ success: false, redirect: '/auth/login' });
      }
      return res.redirect('/auth/login');
    }

    next(); // Move to next middleware
  } catch (error) {
    console.log('User token expired, redirecting to login');
    res.clearCookie('token', { httpOnly: true, sameSite: 'strict' });
    if (req.xhr || req.headers.accept.includes('application/json')) {
      return res.status(401).json({ success: false, redirect: '/auth/login' });
    }
    res.redirect('/auth/login');
  }
});

// Admin Auth
export const isProtected = asyncHandler(async (req, res, next) => {
  const token = req.cookies.adminToken;

  if (!token) {
    console.log('No admin token found');
    return res.redirect('/admin/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
    req.admin = await Admin.findById(decoded.id).select('-password');

    if (!req.admin) {
      console.log('Admin not found');
      return res.redirect('/admin/login');
    }

    next(); // Move to next middleware
  } catch (error) {
    console.log('Admin token expired, redirecting to admin login');
    res.clearCookie('adminToken', { httpOnly: true, sameSite: 'strict' });
    res.redirect('/admin/login');
  }
});

export const attachUserIfAuthenticated = asyncHandler(
  async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      res.locals.isAuthenticated = false;
      return next();
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRETKEY);
      req.user = await User.findOne({
        _id: decoded.id,
        is_blocked: false,
      }).select('-password');
      res.locals.isAuthenticated = true;
    } catch (err) {
      res.clearCookie('token');
    }

    next();
  }
);
