import mongoose from 'mongoose';

const WalletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
    transactionHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: true,
      },
    ],
  },
  { timestamps: true }
);
export const Wallet = mongoose.model('wallet', WalletSchema);
