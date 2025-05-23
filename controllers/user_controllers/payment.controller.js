import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../../model/user_model.js';
import mongoose from 'mongoose';
import { Transaction } from '../../model/transaction.js';
import { Wallet } from '../../model/wallet.js';
import { Cart } from '../../model/cart_model.js';
import { confirmOrder } from '../../services/order.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
const TAX_RATE = 0.05;

export const createWalletOrder = asyncHandler(async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    const userId = req.user._id;
    if (amount < 1) {
      return res
        .status(404)
        .json({
          success: false,
          message: 'Amount must be greater than 1rupee',
        });
    }

    const options = {
      amount: amount * 100,
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    const transaction = new Transaction({
      user: userId,
      amount: amount,
      type: 'CREDIT',
      status: 'PENDING',
      razorpayOrderId: order.id,
    });
    await transaction.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.log(error);

    res.status(500).json({ success: false, message: 'Error creating order' });
  }
});

export const createProductOrder = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id;
    const { shippingAddress, paymentMethod } = req.body;
    if (!shippingAddress || !paymentMethod) {
      throw new Error('Please provide all details');
    }

    const cart = await Cart.findOne({ userId });

    if (!cart || !cart.products.length) {
      throw new Error('Cart is empty');
    }

    const subtotal = cart.totalPrice;
    const discount = cart.discountPrice || 0;
    const couponDiscount = cart.couponDiscount ?? 0;
    const taxAmount = (subtotal - discount) * TAX_RATE;
    const offerApplied = cart.totalOfferDiscount || 0;
    const totalAmount =
      subtotal + taxAmount - discount - couponDiscount - offerApplied;

    //  Create Razorpay order
    const options = {
      amount: Math.round(totalAmount * 100),
      currency: 'INR',
      receipt: `receipt_order_${Date.now()}`,
    };
    const order = await razorpay.orders.create(options);

    // Save temp transaction
    const transaction = new Transaction({
      user: userId,
      amount: totalAmount,
      type: 'DEBIT',
      status: 'PENDING',
      razorpayOrderId: order.id,
      shippingAddress,
      paymentMethod,
    });
    await transaction.save();

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Error creating product order' });
  }
});

export const verifyPayment = asyncHandler(async (req, res) => {
  console.log('verify payment reached');

  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } =
    req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature !== razorpay_signature)
    return res
      .status(500)
      .json({ success: false, message: 'Payment verifcation failed' });

  const session = await mongoose.startSession();

  if (type === 'wallet') {
    try {
      session.startTransaction();

      const userId = req.user._id;
      const user = await User.findById(userId).session(session);
      if (!user) {
        throw new Error('User not found');
      }

      // finding the transaction and updating status
      const transaction = await Transaction.findOne({
        user: userId,
        razorpayOrderId: razorpay_order_id,
      }).session(session);
      transaction.status = 'SUCCESS';

      // pushing transaction to userWallet;
      const wallet = await Wallet.findOne({ user: userId });
      wallet.balance += transaction.amount;
      wallet.transactionHistory.push(transaction._id);

      await transaction.save({ session });
      await wallet.save({ session });
      await session.commitTransaction();
      return res.json({ success: true });
    } catch (error) {
      console.log(error);
      await session.abortTransaction();
      return res.status(500).json({ success: false, message: error.message });
    } finally {
      session.endSession();
    }
  }

  // for the order
  if (type === 'order') {
    try {
      const userId = req.user?._id;
      const { shippingAddress, paymentMethod } = req.body;
      if (!shippingAddress || !paymentMethod) {
        throw new Error('Details are missing ...');
      }
      const result = await confirmOrder(
        userId,
        shippingAddress,
        paymentMethod,
        'COMPLETED'
      );

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
  }
});

// retry payment
export const retryPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  const transaction = await Transaction.findOne({ razorpayOrderId: orderId });
  if (!transaction || transaction.status === 'SUCCESS') {
    return res
      .status(400)
      .json({ success: false, message: 'Invalid or completed transaction' });
  }

  res.status(200).json({
    success: true,
    order: {
      id: transaction.razorpayOrderId,
      amount: transaction.amount * 100,
    },
    shippingAddress: transaction.shippingAddress,
    paymentMethod: transaction.paymentMethod,
  });
});
