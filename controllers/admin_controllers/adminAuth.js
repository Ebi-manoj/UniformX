import asyncHandler from 'express-async-handler';
import { Admin } from '../../model/admin_model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../config/jwt.js';

const adminLogin_layout = './layouts/admin_login';

export const getLogin = asyncHandler(async (req, res) => {
  res.render('admin/admin_login', { layout: adminLogin_layout });
});

export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    console.log('pass empty');

    return res
      .status(404)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.log('user not');

    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    console.log('pass not match');

    return res
      .status(401)
      .json({ success: false, message: 'Invalid Credintials' });
  }
  const token = generateToken(admin._id);
  console.log(token);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.redirect('dashboard');
});

export const getDashboard = asyncHandler(async (req, res) => {
  console.log(req.admin);

  res.send('Admin dashboard');
});
