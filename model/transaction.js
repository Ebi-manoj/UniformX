import mongoose from 'mongoose';

export const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT', 'REFUND'],
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    razorpayOrderId: {
      type: String,
      default: null,
    },
    shippingAddress: {
      type: Object,
      default: {},
    },
    paymentMethod: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Transaction = mongoose.model('transaction', transactionSchema);
