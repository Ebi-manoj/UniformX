import asyncHandler from 'express-async-handler';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { User } from '../../model/user_model.js';
import mongoose from 'mongoose';
import { Transaction, transactionSchema } from '../../model/transaction.js';
import { Wallet } from '../../model/wallet.js';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

export const createOrder = asyncHandler(async (req, res) => {
  try {
    const amount = parseInt(req.body.amount);
    const userId = req.user._id;

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

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, type } =
    req.body;
  console.log(req.body);

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
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
  } else {
    return res.json({ success: false });
  }
});
