import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import Address from '../../model/address.js';
import { Cart } from '../../model/cart_model.js';
import mongoose from 'mongoose';
import { Order } from '../../model/order_model.js';
import { Product } from '../../model/product_model.js';
import puppeteer from 'puppeteer';
import { generateInvoiceHTML } from '../../utilities/invoiceHtml.js';
import fs from 'fs';
import { Buffer } from 'buffer';

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
  const cart = await Cart.find({ userId }).populate('products.productId');

  const taxAmount = (cart[0].totalPrice - cart[0].discountPrice) * TAX_RATE;
  const finalPrice = cart[0].totalPrice - cart[0].discountPrice + taxAmount;
  console.log(cart);
  console.log(taxAmount);
  console.log(finalPrice);
  res.render('user/checkout', {
    js_file: 'checkout',
    layout: userMain,
    addresses,
    cart: cart[0],
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

  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the user's cart and validate it
    const [cart] = await Cart.find({ userId })
      .populate({
        path: 'products.productId',
        select: 'title price image_url sizes status category_id',
      })
      .session(session);

    if (!cart || !cart.products.length) {
      throw new Error('Cart is empty or not found');
    }

    // Calculate order amounts
    const subtotal = cart.totalPrice;
    const discount = cart.discountPrice || 0; // Ensure discount exists
    const taxAmount = subtotal * TAX_RATE;
    const totalAmount = subtotal + taxAmount - discount;

    // Create order items with individual status
    const orderItems = cart.products.map(item => {
      if (!item.productId) {
        throw new Error(`Product not found for cart item: ${item}`);
      }
      return {
        product: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        size: item.size, // Assuming size comes from cart
        quantity: item.quantity,
        image:
          item.productId.image_url && item.productId.image_url.length > 0
            ? item.productId.image_url[0]
            : null,
        status: 'PROCESSING', // Initialize each item's status
        statusHistory: [
          {
            status: 'PROCESSING',
            timestamp: new Date(),
            note: 'Order received',
          },
        ],
      };
    });

    // Create new order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'PENDING',
      subtotal,
      taxAmount,
      discount,
      totalAmount,
    });

    // Save the order
    await order.save({ session });

    // Update product stock
    const updateResults = await Promise.all(
      cart.products.map(async item => {
        return Product.updateOne(
          { _id: item.productId._id, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock_quantity': -item.quantity } },
          { session }
        );
      })
    );

    const failedUpdates = updateResults.filter(res => res.modifiedCount === 0);
    if (failedUpdates.length > 0) {
      throw new Error('Stock update failed for some products');
    }

    // Clear the cart
    await Cart.deleteOne({ _id: cart._id }, { session });

    // Commit the transaction
    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: 'Order placed successfully',
      redirectUrl: '/order-success',
      orderId: order.orderNumber,
    });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    console.error('Order placement error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to place order',
    });
  } finally {
    // End the session
    session.endSession();
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

///////////////////////////////////////////
//Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
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
    const order = await Order.findOne({ _id: orderId, user: userId });

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
    }

    // Recalculate order totals
    const activeItems = order.items.filter(i => i.status !== 'CANCELLED');
    if (activeItems.length > 0) {
      order.subtotal = activeItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      order.taxAmount = order.subtotal * TAX_RATE;
      order.totalAmount =
        order.subtotal +
        order.taxAmount +
        (order.shippingCost || 0) -
        (order.discount || 0);
    } else {
      // If all items are cancelled, mark payment status as refunded if applicable
      if (order.paymentStatus === 'COMPLETED') {
        order.paymentStatus = 'REFUNDED';
      }
      order.totalAmount = 0;
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
