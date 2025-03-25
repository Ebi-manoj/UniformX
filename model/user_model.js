// models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema(
  {
    full_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    is_blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
userSchema.pre('save', async function (next) {
  try {
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    next();
  } catch (error) {
    next(error);
  }
});
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export const User = mongoose.model('user', userSchema);
