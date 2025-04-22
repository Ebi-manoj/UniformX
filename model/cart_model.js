import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'product',
        required: true,
      },
      size: { type: String, required: true },
      quantity: { type: Number, required: true },
      offerApplied: { type: Number, default: 0 },
    },
  ],
  totalPrice: Number,
  discountPrice: Number,
  couponDiscount: Number,
  totalOfferDiscount: Number,
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null,
  },
});

export const Cart = mongoose.model('cart', cartSchema);
