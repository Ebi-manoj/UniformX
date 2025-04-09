import asyncHandler from 'express-async-handler';
import { Order } from '../../model/order_model.js';
import mongoose from 'mongoose';

export const fetchAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;

  // Get query parameters for filtering
  const search = req.query.search || '';
  const status = req.query.status || '';
  const payment = req.query.payment || '';
  const dateRange = req.query.dateRange || '';

  const filter = {};
  let matchedUserIds = [];
  let matchedProductIds = [];
  if (search) {
    const users = await mongoose.model('user').find({
      full_name: { $regex: search, $options: 'i' },
    });
    matchedUserIds = users.map(u => u._id);

    const products = await mongoose.model('product').find({
      title: { $regex: search, $options: 'i' },
    });
    matchedProductIds = products.map(p => p._id);

    // Build search filter
    filter.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { user: { $in: matchedUserIds } },
      { 'items.product': { $in: matchedProductIds } },
    ];
  }

  // Status filter
  if (status) {
    filter.items = { $elemMatch: { status: status.toUpperCase() } };
  }

  // Payment filter
  if (payment) {
    filter.paymentStatus = payment.toUpperCase();
  }

  // Date range filter
  const now = new Date();
  let startDate = null;
  switch (dateRange) {
    case '7days':
      startDate = new Date(now.setDate(now.getDate() - 7));
      break;
    case 'today':
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;
    case '30days':
      startDate = new Date(now.setDate(now.getDate() - 30));
      break;
    default:
      break;
  }
  if (startDate) {
    filter.createdAt = { $gte: startDate };
  }

  // Count total orders with filters
  const totalOrders = await Order.countDocuments(filter);

  // Fetch orders with filters
  const orders = await Order.find(filter)
    .populate('user', 'full_name email')
    .populate('items.product', 'title color discountPercentage')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.render('admin/orders', {
    success: true,
    js_file: 'order',
    orders,
    page,
    limit,
    totalOrders,
    totalPages: Math.ceil(totalOrders / limit),
    search,
    status,
    payment,
    dateRange,
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { itemId, note } = req.body;
  const status = req.body?.status.toUpperCase();

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  const validStatus = [
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
  ];
  if (!validStatus.includes(status)) {
    return res.status(404).json({ success: false, message: 'Invalid Status' });
  }

  const itemIndex = order.items.findIndex(
    item => item._id.toString() === itemId.toString()
  );
  if (itemIndex == -1) {
    return res.status(404).json({ success: false, message: 'Invalid Order' });
  }

  const item = order.items[itemIndex];
  item.status = status;
  item.statusHistory.push({
    status,
    timestamp: Date.now(),
    note: note || `Order is now on ${status}`,
  });

  if (
    status === 'DELIVERED' &&
    order.paymentMethod === 'COD' &&
    item.paymentStatus === 'PENDING'
  ) {
    item.paymentStatus = 'COMPLETED';
    order.paymentDetails = {
      ...order.paymentDetails,
      paidAt: Date.now(),
    };
  }
  await order.save();
  res.status(200).json({
    success: true,
    message: 'Order item status updated successfully',
    order,
  });
});
