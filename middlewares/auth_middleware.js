import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import { Admin } from '../model/admin_model.js';
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
    res.redirect('login');
  }
});
