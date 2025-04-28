import { Order } from '../model/order_model.js';
import moment from 'moment';
export const fetchSalesReportData = async ({
  type = 'daily',
  startDate,
  endDate,
  page = 1,
  limit = 10,
  req,
}) => {
  // Set date range based on filter type
  let dateFilter = {};
  const today = moment().startOf('day');
  switch (type.trim().toLowerCase()) {
    case 'daily':
      dateFilter = {
        createdAt: {
          $gte: today.toDate(),
          $lte: moment(today).endOf('day').toDate(),
        },
      };
      break;
    case 'weekly':
      dateFilter = {
        createdAt: {
          $gte: moment().subtract(7, 'days').startOf('day').toDate(),
          $lte: moment(today).endOf('day').toDate(), // changed here
        },
      };
      break;
    case 'monthly':
      dateFilter = {
        createdAt: {
          $gte: moment().subtract(30, 'days').startOf('day').toDate(),
          $lte: moment(today).endOf('day').toDate(), // changed here
        },
      };
      break;
    case 'custom':
      if (!startDate || !endDate) {
        req.flash('error', 'Start and end dates are required for custom range');
        throw new Error('Redirect required');
      }
      dateFilter = {
        createdAt: {
          $gte: moment(startDate).startOf('day').toDate(),
          $lte: moment(endDate).endOf('day').toDate(),
        },
      };
      break;
    default:
      req.flash('error', 'Invalid report type');
      throw new Error('Redirect required');
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

  // Fetch orders
  const skip = (page - 1) * limit;
  const orders = await Order.find(dateFilter)
    .populate('user', 'full_name')
    .skip(skip)
    .limit(Number(limit))
    .select(
      'orderNumber createdAt subtotal totalAmount discount couponDiscount paymentMethod'
    )
    .lean();

  const totalOrders = await Order.countDocuments(dateFilter);

  // Format orders
  const formattedOrders = orders.map(order => ({
    orderNumber: order.orderNumber,
    user: order.user?.full_name || 'Unknown',
    date: moment(order.createdAt).format('YYYY-MM-DD'),
    totalAmount: order.subtotal,
    discount: order.discount,
    couponDiscount: order.couponDiscount,
    finalAmount: order.totalAmount,
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
    filterType: type,
  };
};
