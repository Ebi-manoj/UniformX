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
    },
  ],
  totalPrice: Number,
  discountPrice: Number,
  couponDiscount: Number,
  coupon: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon',
    default: null,
  },
});

export const Cart = mongoose.model('cart', cartSchema);
