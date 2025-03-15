// models/userModel.js
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
const userSchema = new mongoose.Schema({
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
  },
  password: {
    type: String,
    required: true,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
  join_date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: 'user',
  },
  status: {
    type: String,
    default: 'active',
  },
});
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

export const User = mongoose.model('user', userSchema);
