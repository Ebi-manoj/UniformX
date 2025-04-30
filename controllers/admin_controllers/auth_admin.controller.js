import asyncHandler from 'express-async-handler';
import { Admin } from '../../model/admin_model.js';
import { Order } from '../../model/order_model.js';
import bcrypt from 'bcrypt';
import { generateToken } from '../../config/jwt.js';
import { dashboardQueries } from '../../utilities/DbQueries.js';
import { User } from '../../model/user_model.js';

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

export const logout = asyncHandler(async (req, res) => {
  res.clearCookie('adminToken', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.redirect('login');
});

// Get Dashboard Analytics Data
export const getDashboardDetails = asyncHandler(async (req, res) => {
  try {
    const timeFilter = req.query.timeFilter || 'monthly';
    const currentDate = new Date();
    let startDate, endDate;

    // Set date range based on filter
    switch (timeFilter) {
      case 'daily':
        startDate = new Date(currentDate.setHours(0, 0, 0, 0));
        endDate = new Date(currentDate.setHours(23, 59, 59, 999));
        break;
      case 'weekly':
        // Start of the week (Sunday)
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        startDate.setHours(0, 0, 0, 0);

        // End of the week (Saturday)
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'monthly':
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
        break;
      case 'yearly':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        endDate = new Date(currentDate.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;
      default:
        startDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth(),
          1
        );
        endDate = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0,
          23,
          59,
          59,
          999
        );
    }

    // Get total sales for the period
    const totalSalesData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get unique customers count
    const customersData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: '$user',
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .lean();

    // Get time series data for charts
    let timeSeriesData;
    let timeSeriesLabels;

    switch (timeFilter) {
      case 'daily':
        // Get hourly data for the day
        timeSeriesData = await getDailyTimeSeriesData(startDate, endDate);
        timeSeriesLabels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
        break;
      case 'weekly':
        // Get daily data for the week
        timeSeriesData = await getWeeklyTimeSeriesData(startDate, endDate);
        timeSeriesLabels = [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ];
        break;
      case 'monthly':
        // Get daily data for the month
        timeSeriesData = await getMonthlyTimeSeriesData(startDate, endDate);
        const daysInMonth = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        timeSeriesLabels = Array.from(
          { length: daysInMonth },
          (_, i) => `Day ${i + 1}`
        );
        break;
      case 'yearly':
        // Get monthly data for the year
        timeSeriesData = await getYearlyTimeSeriesData(startDate, endDate);
        timeSeriesLabels = [
          'Jan',
          'Feb',
          'Mar',
          'Apr',
          'May',
          'Jun',
          'Jul',
          'Aug',
          'Sep',
          'Oct',
          'Nov',
          'Dec',
        ];
        break;
      default:
        timeSeriesData = await getMonthlyTimeSeriesData(startDate, endDate);
        const days = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + 1,
          0
        ).getDate();
        timeSeriesLabels = Array.from(
          { length: days },
          (_, i) => `Day ${i + 1}`
        );
    }

    // Get top products, categories, and brands
    const topProducts = await getTopProducts(startDate, endDate);
    const topCategories = await getTopCategories(startDate, endDate);
    const topClubs = await getTopClubs(startDate, endDate);

    // Calculate monthly goal progress (example goal: 1000 orders)
    const monthlyGoal = 1000;
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    const currentMonthOrders = await Order.countDocuments({
      createdAt: { $gte: currentMonthStart, $lte: currentMonthEnd },
    });

    const ordersLeft = Math.max(0, monthlyGoal - currentMonthOrders);
    const goalProgress = (currentMonthOrders / monthlyGoal) * 100;

    res.json({
      totalSales: totalSalesData.length > 0 ? totalSalesData[0].totalAmount : 0,
      totalOrders: totalSalesData.length > 0 ? totalSalesData[0].count : 0,
      customers: customersData.length > 0 ? customersData[0].count : 0,
      recentOrders,
      timeSeriesData,
      timeSeriesLabels,
      topProducts,
      topCategories,
      topClubs,
      monthlyGoal,
      currentMonthOrders,
      ordersLeft,
      goalProgress,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper functions for time series data
async function getDailyTimeSeriesData(startDate, endDate) {
  const hourlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $hour: '$createdAt' },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing hours with 0
  const result = Array(24).fill(0);
  hourlyData.forEach(item => {
    result[item._id] = item.totalAmount;
  });

  return result;
}

async function getWeeklyTimeSeriesData(startDate, endDate) {
  const dailyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: '$createdAt' }, // 1 for Sunday, 2 for Monday, etc.
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing days with 0 (dayOfWeek is 1-7, where 1 is Sunday)
  const result = Array(7).fill(0);
  dailyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-6
  });

  return result;
}

async function getMonthlyTimeSeriesData(startDate, endDate) {
  const dailyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: '$createdAt' },
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Get number of days in the month
  const daysInMonth = new Date(
    endDate.getFullYear(),
    endDate.getMonth() + 1,
    0
  ).getDate();

  // Fill in missing days with 0
  const result = Array(daysInMonth).fill(0);
  dailyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-based
  });

  return result;
}

async function getYearlyTimeSeriesData(startDate, endDate) {
  const monthlyData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $group: {
        _id: { $month: '$createdAt' }, // 1 for January, 2 for February, etc.
        totalAmount: { $sum: '$totalAmount' },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Fill in missing months with 0
  const result = Array(12).fill(0);
  monthlyData.forEach(item => {
    result[item._id - 1] = item.totalAmount; // Adjust index to 0-based
  });

  return result;
}

// Helper functions for top items
async function getTopProducts(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $group: {
        _id: '$items.product',
        title: { $first: '$items.title' },
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}

async function getTopCategories(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products', // Collection name is lowercase plural in MongoDB
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $group: {
        _id: '$productInfo.category_id', // Changed to match your schema
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $lookup: {
        from: 'categories', // Collection name is lowercase plural in MongoDB
        localField: '_id',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $project: {
        name: '$categoryInfo.name',
        totalSales: 1,
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}

async function getTopClubs(startDate, endDate) {
  return Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
    {
      $unwind: '$items',
    },
    {
      $lookup: {
        from: 'products', // Collection name for your products
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    {
      $unwind: '$productInfo',
    },
    {
      $group: {
        _id: '$productInfo.club_id', // Changed from brand to club_id to match your schema
        totalSales: {
          $sum: { $multiply: ['$items.price', '$items.quantity'] },
        },
      },
    },
    {
      $lookup: {
        from: 'clubs', // Your Club model is exported with collection name 'clubs'
        localField: '_id',
        foreignField: '_id',
        as: 'clubInfo',
      },
    },
    {
      $unwind: '$clubInfo',
    },
    {
      $project: {
        name: '$clubInfo.name', // Project the club name
        totalSales: 1,
      },
    },
    {
      $sort: { totalSales: -1 },
    },
    {
      $limit: 10,
    },
  ]);
}
