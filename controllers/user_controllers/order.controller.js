import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import Address from '../../model/address.js';
import { Cart } from '../../model/cart_model.js';
import { Order } from '../../model/order_model.js';
import { Product } from '../../model/product_model.js';
import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from '../../utilities/invoiceHtml.js';
import { Buffer } from 'buffer';
import { Coupon } from '../../model/coupon.js';
import { confirmOrder } from '../../services/order.js';
import { Transaction } from '../../model/transaction.js';
import { Wallet } from '../../model/wallet.js';

const userMain = './layouts/user_main';
const TAX_RATE = 0.05;

export const getCheckout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('error', 'session expired!');
    return res.redirect('/cart');
  }
  //address
  const addresses = await Address.find({ userId });

  // cart
  const cart = await Cart.findOne({ userId }).populate('products.productId');

  // coupon calculation
  const couponId = cart.coupon;
  if (couponId) {
    const coupon = await Coupon.findById(couponId);
    if (coupon.discountType === 'fixed') {
      cart.couponDiscount = coupon.discountAmount;
    } else {
      const finalPrice = cart.totalPrice - cart.discountPrice;
      const maxRedeem = coupon.maxRedeem ?? 5000;
      const couponDiscount = (finalPrice * coupon.discountAmount) / 100;
      cart.couponDiscount =
        couponDiscount > maxRedeem ? maxRedeem : couponDiscount;
    }
    if (coupon && cart.totalPrice < coupon.minimumPurchase) {
      cart.coupon = null;
      cart.couponDiscount = 0;
    }
    await cart.save();
  }

  const couponDiscount = cart.couponDiscount ?? 0;
  const offerApplied = cart?.totalOfferDiscount ?? 0;
  const taxAmount = (cart.totalPrice - cart.discountPrice) * TAX_RATE;
  const finalPrice =
    cart.totalPrice -
    cart.discountPrice -
    couponDiscount -
    offerApplied +
    taxAmount;

  console.log(cart);
  console.log(taxAmount);
  console.log(finalPrice);
  res.render('user/checkout', {
    js_file: 'checkout',
    layout: userMain,
    addresses,
    cart,
    taxAmount,
    finalPrice,
  });
});

///////////////////////
//Place an Order
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const { shippingAddress, paymentMethod } = req.body;

  if (!validateId(userId)) {
    req.flash('error', 'Session expired');
    return res.redirect('/checkout');
  }
  console.log(paymentMethod);
  try {
    const result = await confirmOrder(userId, shippingAddress, paymentMethod);
    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      redirectUrl: '/order-success',
      orderId: result.orderNumber,
    });
  } catch (error) {
    console.error('Order error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order',
    });
  }
});

/////////////////////////////////////////////
////Get order Success Page

export const getOrderSucces = asyncHandler(async (req, res) => {
  const orderNumber = req.params.id;
  console.log(orderNumber);

  const order = await Order.findOne({ orderNumber }).populate('user', 'email');
  if (!order) {
    req.flash('error', 'Something went wrong');
    return res.redirect('/cart');
  }
  console.log(order);
  const details = {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    customerEmail: order.user.email,
    totalAmount: order.totalAmount,
  };
  res.render('user/success_order', { layout: userMain, details });
});

/////////////////////////////////////////////////
// Get order failure
export const getOrderFailure = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const details = {
    orderId,
    date: new Date().toDateString(),
  };
  console.log(orderId, details);

  res.render('user/order_failure', {
    js_file: 'checkout',
    layout: userMain,
    details,
  });
});

///////////////////////////////////////////
//Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ user: userId })
    .sort({ createdAt: -1 })
    .populate('user', 'full_name email');
  res.render('user/orders', { layout: userMain, orders, js_file: 'order' });
});

///////////////////////////////////////////////
///Get Single Order
export const getOrder = asyncHandler(async (req, res) => {
  const orderId = req.params.id;
  if (!validateId(orderId)) {
    req.flash('error', 'Invalid Order');
    return res.redirect('/orders');
  }
  const order = await Order.findOne({ _id: orderId }).populate(
    'user',
    'full_name'
  );

  res.render('user/order_detail', {
    layout: userMain,
    js_file: 'order',
    order,
  });
});

///////////////////////////////////////////////////////////////
// Cancel a specific item in an order
export const cancelOrder = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params;
    const { itemId, reason } = req.body;
    const userId = req.user._id;

    // Find the order
    const order = await Order.findOne({ _id: orderId, user: userId }).populate(
      'coupon',
      'minimumPurchase'
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found or you don't have permission",
      });
    }

    // Find the item in the order
    const itemIndex = order.items.findIndex(
      item => item._id.toString() === itemId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in order',
      });
    }

    const item = order.items[itemIndex];

    // Check if item can be cancelled
    if (['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(item.status)) {
      return res.status(400).json({
        success: false,
        message: `Item cannot be cancelled - current status: ${item.status}`,
      });
    }
    const baseAmount = item.price * item.quantity;
    const totalSubtotal = order.subtotal;
    const totalAmount = order.totalAmount;
    const proportion = baseAmount / totalSubtotal;
    item.returnRequest.refundAmount = +(proportion * totalAmount).toFixed(2);

    let refundAmount = item.returnRequest.refundAmount;

    // Handle refund for non-COD orders
    if (order.paymentMethod !== 'COD' && item.paymentStatus === 'COMPLETED') {
      const transaction = new Transaction({
        user: userId,
        amount: refundAmount,
        type: 'REFUND',
        status: 'SUCCESS',
      });
      await transaction.save();

      let wallet = await Wallet.findOne({ user: userId });
      if (!wallet) {
        wallet = new Wallet({
          user: userId,
          transactionHistory: [],
        });
      }
      wallet.balance += refundAmount; // Add refund to wallet balance
      wallet.transactionHistory.push(transaction._id);
      await wallet.save();

      // Update refund status
      item.paymentStatus = 'REFUNDED';
    }

    // Update item status and add to history
    item.status = 'CANCELLED';
    item.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: reason || 'Customer cancelled item',
    });

    // Restore stock
    const product = await Product.findById(item.product);
    const sizeData = product.sizes.find(
      s => s.size.toLowerCase() === item.size.toLowerCase()
    );

    if (sizeData) {
      sizeData.stock_quantity += item.quantity;
      await product.save();
    } else {
      throw new Error(`Size ${item.size} not found for product`);
    }

    // If all items are cancelled, update order payment status
    const allCancelled = order.items.every(i => i.status === 'CANCELLED');
    if (allCancelled && order.paymentStatus === 'COMPLETED') {
      order.paymentStatus = 'REFUNDED';
    }

    await order.save();

    res.json({
      success: true,
      message: 'Item cancelled successfully',
      order: {
        id: order._id,
        item: {
          id: item._id,
          status: item.status,
          statusHistory: item.statusHistory,
        },
        totalAmount: order.totalAmount,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling item',
    });
  }
});

///////////////////////////////
///download invoice
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  try {
    const order = await Order.findById(orderId).populate('user', 'name email');

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Order not found' });
    }

    const htmlContent = generateInvoiceHTML(order);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath:
        process.env.NODE_ENV === 'production'
          ? '/usr/bin/chromium-browser'
          : undefined,
    });
    const page = await browser.newPage();

    // Set content and wait for rendering
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    });

    await browser.close();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=invoice-${order.orderNumber}.pdf`
    );
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Transfer-Encoding', 'binary');

    // Send the PDF buffer as a stream to avoid corruption
    res.send(Buffer.from(pdfBuffer));
  } catch (err) {
    console.error('Error generating invoice:', err);
    if (!res.headersSent) {
      return res
        .status(500)
        .json({ success: false, message: 'Failed to generate invoice' });
    }
  }
});

// return order

export const returnOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { itemId, reason } = req.body;

  if (!validateId(orderId)) {
    return res.status(404).json({
      success: false,
      message: 'Invalid Order or you dont have Permission',
    });
  }
  if (!itemId || !reason) {
    return res.status(404).json({ success: false, messge: 'Field are empty' });
  }

  const order = await Order.findById(orderId);
  if (!order)
    return res.status(404).json({ success: false, messgae: 'Order not Found' });

  const item = order.items.id(itemId);
  if (!item)
    return res.status(404).json({ success: false, message: 'Item not found' });

  item.status = 'RETURN REQUESTED';
  item.returnRequest = {
    status: 'REQUESTED',
    reason,
    requestedAt: new Date(),
    resolvedAt: new Date(),
    refundAmount: item.price * item.quantity,
  };
  item.statusHistory.push({ status: 'RETURN REQUESTED', note: reason });

  await order.save();
  res.json({
    success: true,
    message: 'Return requested..Wait For the approval',
  });
});
