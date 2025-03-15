import asyncHandler from 'express-async-handler';
import { Admin } from '../../model/admin_model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../config/jwt.js';

const adminLogin_layout = './layouts/admin_login';

// Get Login Page
export const getLogin = asyncHandler(async (req, res) => {
  if (req.cookies.token) return res.redirect('dashboard');
  else res.render('admin/admin_login', { layout: adminLogin_layout });
});

// Verify Login
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const token = generateToken(admin._id);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.status(200).json({ success: true, message: 'Login successfully' });
});

export const getDashboard = asyncHandler(async (req, res) => {
  if (!req.cookies.token) return res.redirect('login');
  res.render('admin/dashboard', { cssFile: 'admin_dashboard' });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.redirect('login');
});
