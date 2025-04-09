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
          ref: 'product',
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
        paymentStatus: {
          type: String,
          enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
          default: 'PENDING',
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
        expectedDelivery: {
          type: Date,
          default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
          },
        },
        returnRequest: {
          status: {
            type: String,
            enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'],
            default: 'NONE',
          },
          reason: String,
          requestedAt: Date,
          resolvedAt: Date,
          refundAmount: Number, // Amount refunded for this item
        },
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
      enum: [
        'PENDING',
        'PARTIALLY_COMPLETED',
        'COMPLETED',
        'FAILED',
        'REFUNDED',
      ],
      default: 'PENDING',
    },
    paymentDetails: {
      transactionId: String,
      paidAt: Date,
    },
    subtotal: Number,
    taxAmount: Number,
    shippingCost: {
      type: Number,
      default: 0,
    },
    discount: Number,
    totalAmount: Number,
    invoiceUrl: String,
    returnRequest: {
      // Optional: Keep order-level return request for full order returns
      status: {
        type: String,
        enum: ['NONE', 'REQUESTED', 'APPROVED', 'REJECTED', 'COMPLETED'],
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
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
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

// Method to update paymentStatus based on item statuses
OrderSchema.methods.updatePaymentStatus = function () {
  const paidItems = this.items.filter(
    item => item.paymentStatus === 'COMPLETED'
  ).length;
  const totalItems = this.items.length;
  const refundedItems = this.items.filter(
    item => item.paymentStatus === 'REFUNDED'
  ).length;
  const allCompleted = this.items.every(
    item => item.paymentStatus === 'COMPLETED'
  );
  const allRefunded = this.items.every(
    item => item.paymentStatus === 'REFUNDED'
  );

  if (allCompleted) {
    this.paymentStatus = 'COMPLETED';
    this.paymentDetails = this.paymentDetails || {};
    this.paymentDetails.paidAt = new Date();
  } else if (refundedItems > 0 && refundedItems < totalItems) {
    this.paymentStatus = 'PARTIALLY_COMPLETED';
  } else if (allRefunded) {
    this.paymentStatus = 'REFUNDED';
  } else if (paidItems === 0 && this.paymentStatus !== 'FAILED') {
    this.paymentStatus = 'PENDING';
  }
};

// Pre-save middleware
OrderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.updatePaymentStatus();
    next();
  }
});

export const Order = mongoose.model('Order', OrderSchema);
