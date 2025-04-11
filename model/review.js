import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate reviews by same user for same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const Review = mongoose.model('review', reviewSchema);
