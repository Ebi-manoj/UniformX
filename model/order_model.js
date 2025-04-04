import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        title: String,
        price: Number,
        size: String,
        quantity: Number,
        image: String,
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
    orderNumber: {
      type: String,
      unique: true,
    },
  },
  { timestamps: true }
);

// Generate order number before saving
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '')}-${(count + 1).toString().padStart(3, '0')}`;
  }
  next();
});

export const Order = mongoose.model('Order', OrderSchema);
