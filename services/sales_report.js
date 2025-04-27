import mongoose from 'mongoose';
import { Order } from '../model/order_model.js';
import moment from 'moment';

// prettier-ignore
export const fetchSalesReportData = async ({ type = 'daily', startDate, endDate, page = 1, limit = 10 }) => {
  // Set date range based on filter type
  let dateFilter = {};
  const today = moment().startOf('day');
  let reportTitle = 'Sales Report';

  switch (type.toLowerCase()) {
    case 'daily':
      dateFilter = {
        createdAt: {
          $gte: today.toDate(),
          $lte: moment(today).endOf('day').toDate(),
        },
      };
      reportTitle = 'Daily Sales Report';
      break;
    case 'weekly':
      dateFilter = {
        createdAt: {
          $gte: moment().subtract(7, 'days').startOf('day').toDate(),
          $lte: today.toDate(),
        },
      };
      reportTitle = 'Weekly Sales Report';
      break;
    case 'monthly':
      dateFilter = {
        createdAt: {
          $gte: moment().subtract(30, 'days').startOf('day').toDate(),
          $lte: today.toDate(),
        },
      };
      reportTitle = 'Monthly Sales Report';
      break;
    case 'custom':
      if (!startDate || !endDate) {
        throw new Error('Start and end dates are required for custom range');
      }
      dateFilter = {
        createdAt: {
          $gte: moment(startDate).startOf('day').toDate(),
          $lte: moment(endDate).endOf('day').toDate(),
        },
      };
      reportTitle = `Sales Report (${moment(startDate).format('YYYY-MM-DD')} to ${moment(endDate).format('YYYY-MM-DD')})`;
      break;
    default:
      throw new Error('Invalid report type');
  }

  // Aggregate summary metrics
  const summary = await Order.aggregate([
    { $match: dateFilter },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$totalAmount' },
        totalDiscount: { $sum: '$discount' },
        totalCouponDiscount: { $sum: '$couponDiscount' },
      },
    },
  ]);

  const metrics = summary[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    totalCouponDiscount: 0,
  };
  metrics.totalOverallDiscount = metrics.totalDiscount + metrics.totalCouponDiscount;

  // Fetch detailed orders for table
  const skip = (page - 1) * limit;
  const orders = await Order.find(dateFilter)
    .populate('user', 'name')
    .skip(skip)
    .limit(Number(limit))
    .select('orderNumber createdAt totalAmount discount couponDiscount paymentMethod')
    .lean();

  const totalOrders = await Order.countDocuments(dateFilter);

  // Format orders
  const formattedOrders = orders.map(order => ({
    orderNumber: order.orderNumber,
    user: order.user?.name || 'Unknown',
    date: moment(order.createdAt).format('YYYY-MM-DD'),
    totalAmount: order.totalAmount,
    discount: order.discount,
    couponDiscount: order.couponDiscount,
    finalAmount: order.totalAmount, // totalAmount is final
    paymentMethod: order.paymentMethod,
  }));

  return {
    metrics,
    orders: formattedOrders,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      limit: Number(limit),
    },
    dateRange: {
      start: moment(dateFilter.createdAt.$gte).format('YYYY-MM-DD'),
      end: moment(dateFilter.createdAt.$lte).format('YYYY-MM-DD'),
    },
    reportTitle,
    filterType: type,
  };
};
