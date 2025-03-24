import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
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
    discountPercentage: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
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
