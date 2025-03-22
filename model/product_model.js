import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    description: String,
    color: String,
    sizes: [{ size: String, stock_quantity: Number }],
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
      required: true,
    },
    club_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'clubs',
      required: true,
    },
    type: String,
    image_url: [String],
    is_deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Product = mongoose.model('product', productSchema);
