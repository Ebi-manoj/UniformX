import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function () {
      return this.purpose !== 'signup';
    },
  },
  email: {
    type: String,
    required: function () {
      return this.purpose === 'signup';
    },
  },
  otp: {
    type: String,
    required: true,
  },
  purpose: {
    type: String,
    enum: ['signup', 'forgotPassword'],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Automatically remove expired OTPs
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const OTP = mongoose.model('Otp', otpSchema);
