import asyncHandler from 'express-async-handler';
import { Admin } from '../../model/admin_model.js';
import { Order } from '../../model/order_model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../config/jwt.js';
import moment from 'moment';

const adminLogin_layout = './layouts/admin_login';

// Get Login Page
export const getLogin = asyncHandler(async (req, res) => {
  if (req.cookies.adminToken) return res.redirect('dashboard');
  res.render('admin/admin_login', { layout: adminLogin_layout });
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

  res.cookie('adminToken', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({ success: true, message: 'Login successfully' });
});

export const getDashboard = asyncHandler(async (req, res) => {
  res.render('admin/dashboard');
});

export const getDashboardDetails = asyncHandler(async (req, res) => {
  const today = moment().startOf('day').toDate();
  const startOfMonth = moment().startOf('month').toDate();
  const endOfMonth = moment().endOf('month').toDate();

  const totalSales = await Order.aggregate([
    {
      $match: {
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
        paymentStatus: 'COMPLETED',
      },
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
      },
    },
  ]);
  const sales = totalSales[0] || { totalRevenue: 0, orderCount: 0 };
  res.status(200).json({ sales });
});

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.redirect('login');
});
