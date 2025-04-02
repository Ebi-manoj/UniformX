import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  products: [{ productId: String, quantity: Number }],
  totalPrice: Number,
});

export const Cart = mongoose.model('cart', cartSchema);
