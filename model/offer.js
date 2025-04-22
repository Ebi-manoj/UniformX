import mongoose, { mongo } from 'mongoose';

const offerSchema = new mongoose.Schema({
  offerName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
  },
  product: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
    },
  ],
  category: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'category',
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  validFrom: Date,
  validTo: Date,
});

offerSchema.methods.isValid = function () {
  const now = new Date();
  return (
    this.isActive &&
    (!this.validFrom || now >= this.validFrom) &&
    (!this.validTo || now <= this.validTo)
  );
};

export const Offer = mongoose.model('offer', offerSchema);
