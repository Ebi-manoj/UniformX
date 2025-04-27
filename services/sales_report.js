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
  // Set date range
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
          $lte: today.toDate(),
        },
      };
      break;
    case 'monthly':
      dateFilter = {
        createdAt: {
          $gte: moment().subtract(30, 'days').startOf('day').toDate(),
          $lte: today.toDate(),
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

  // Aggregate to find orders with at least one delivered item
  const deliveredOrders = await Order.aggregate([
    { $match: dateFilter },
    {
      $addFields: {
        deliveredItems: {
          $filter: {
            input: '$items',
            cond: { $eq: ['$$this.status', 'DELIVERED'] },
          },
        },
      },
    },
    { $match: { 'deliveredItems.0': { $exists: true } } }, // At least one delivered item
    {
      $addFields: {
        deliveredSubtotal: {
          $sum: {
            $map: {
              input: '$deliveredItems',
              as: 'item',
              in: {
                $subtract: [
                  '$$item.totalPrice',
                  { $ifNull: ['$$item.refundAmount', 0] },
                ],
              },
            },
          },
        },
        deliveredItemDiscount: {
          $sum: {
            $map: {
              input: '$deliveredItems',
              as: 'item',
              in: { $ifNull: ['$$item.discount', 0] },
            },
          },
        },
        totalSubtotal: { $sum: '$items.totalPrice' },
      },
    },
    {
      $addFields: {
        deliveredDiscount: {
          $cond: {
            if: { $gt: ['$deliveredItemDiscount', 0] },
            then: '$deliveredItemDiscount',
            else: {
              $cond: {
                if: { $gt: ['$totalSubtotal', 0] },
                then: {
                  $multiply: [
                    '$discount',
                    { $divide: ['$deliveredSubtotal', '$totalSubtotal'] },
                  ],
                },
                else: 0,
              },
            },
          },
        },
        couponDiscountForDelivered: {
          $cond: {
            if: { $gt: ['$totalSubtotal', 0] },
            then: {
              $multiply: [
                '$couponDiscount',
                { $divide: ['$deliveredSubtotal', '$totalSubtotal'] },
              ],
            },
            else: 0,
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        orderNumber: 1,
        deliveredDiscount: 1,
        deliveredSubtotal: 1,
        couponDiscountForDelivered: 1,
      },
    },
  ]);

  const orderIds = deliveredOrders.map(order => order._id);
  console.log(
    'Delivered Orders:',
    deliveredOrders.map(o => ({
      orderNumber: o.orderNumber,
      deliveredDiscount: o.deliveredDiscount,
      deliveredSubtotal: o.deliveredSubtotal,
    }))
  );

  // Aggregate summary metrics for delivered orders
  const summary = await Order.aggregate([
    { $match: { _id: { $in: orderIds } } },
    {
      $addFields: {
        deliveredItems: {
          $filter: {
            input: '$items',
            cond: { $eq: ['$$this.status', 'DELIVERED'] },
          },
        },
      },
    },
    {
      $addFields: {
        deliveredSubtotal: {
          $sum: {
            $map: {
              input: '$deliveredItems',
              as: 'item',
              in: {
                $subtract: [
                  '$$item.totalPrice',
                  { $ifNull: ['$$item.refundAmount', 0] },
                ],
              },
            },
          },
        },
        deliveredItemDiscount: {
          $sum: {
            $map: {
              input: '$deliveredItems',
              as: 'item',
              in: { $ifNull: ['$$item.discount', 0] },
            },
          },
        },
        totalSubtotal: { $sum: '$items.totalPrice' },
      },
    },
    {
      $addFields: {
        deliveredDiscount: {
          $cond: {
            if: { $gt: ['$deliveredItemDiscount', 0] },
            then: '$deliveredItemDiscount',
            else: {
              $cond: {
                if: { $gt: ['$totalSubtotal', 0] },
                then: {
                  $multiply: [
                    '$discount',
                    { $divide: ['$deliveredSubtotal', '$totalSubtotal'] },
                  ],
                },
                else: 0,
              },
            },
          },
        },
        couponDiscountForDelivered: {
          $cond: {
            if: { $gt: ['$totalSubtotal', 0] },
            then: {
              $multiply: [
                '$couponDiscount',
                { $divide: ['$deliveredSubtotal', '$totalSubtotal'] },
              ],
            },
            else: 0,
          },
        },
      },
    },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalRevenue: { $sum: '$deliveredSubtotal' },
        totalDiscount: { $sum: '$deliveredDiscount' },
        totalCouponDiscount: { $sum: '$couponDiscountForDelivered' },
      },
    },
  ]);

  const metrics = summary[0] || {
    totalOrders: 0,
    totalRevenue: 0,
    totalDiscount: 0,
    totalCouponDiscount: 0,
  };
  console.log('Metrics:', metrics);

  // Fetch orders for table
  const skip = (page - 1) * limit;
  const orders = await Order.find({ _id: { $in: orderIds } })
    .populate('user', 'full_name')
    .skip(skip)
    .limit(Number(limit))
    .select(
      'orderNumber createdAt subtotal totalAmount discount couponDiscount paymentMethod items'
    )
    .lean();

  const totalOrders = orderIds.length;

  // Format orders
  const formattedOrders = orders.map(order => {
    const deliveredItems = order.items.filter(
      item => item.status === 'DELIVERED'
    );
    return {
      orderNumber: order.orderNumber,
      user: order.user?.full_name || 'Unknown',
      date: moment(order.createdAt).format('YYYY-MM-DD'),
      totalAmount: order.subtotal,
      discount: order.discount,
      couponDiscount: order.couponDiscount,
      finalAmount: order.totalAmount,
      paymentMethod: order.paymentMethod,
      deliveredItemCount: deliveredItems.length,
      totalItemCount: order.items.length,
    };
  });

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
