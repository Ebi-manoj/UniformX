import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    shippingAddress: {
      name: String,
      street_address: String,
      district: String,
      state: String,
      pincode: String,
      country: String,
      mobile: String,
    },
    paymentMethod: {
      type: String,
      enum: ['COD', 'CARD', 'UPI', 'BANK'],
      default: 'COD',
    },
    paymentStatus: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'PENDING',
    },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
    },
    subtotal: Number,
    taxAmount: Number,
    shippingCost: Number,
    discount: Number,
    totalAmount: Number,
    status: {
      type: String,
      enum: [
        'PROCESSING',
        'PACKED',
        'SHIPPED',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
      ],
      default: 'PROCESSING',
    },
    statusHistory: [
      {
        status: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
        note: String,
      },
    ],
    invoiceUrl: String,
    returnRequest: {
      status: {
        type: String,
        enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'],
        default: 'NONE',
      },
      reason: String,
      requestedAt: Date,
      resolvedAt: Date,
    },
    cancelRequest: {
      status: {
        type: String,
        enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED'],
        default: 'NONE',
      },
      reason: String,
      requestedAt: Date,
      resolvedAt: Date,
    },
  },
  { timestamp: true }
);

export const Order = mongoose.model('Order', OrderSchema);
