import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import { Transaction } from '../../model/transaction.js';
import { Wallet } from '../../model/wallet.js';
const userMain = './layouts/user_main';

export const getReferal = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);
  const referals = {
    referalToken: user.referalToken,
    totalUsed: user.sharedReferals.length ?? 0,
    totalEarned: user.sharedReferals * 100,
  };
  console.log(referals);

  res.render('user/referal', { layout: userMain, referals });
});

export const applyReferal = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const referalToken = req.params.referalToken;
  console.log(referalToken);

  if (!referalToken || referalToken.length < 9) {
    return res
      .status(404)
      .json({ success: false, message: 'Please provide a valid token' });
  }

  const existing = await User.findOne({ referalToken });
  if (!existing) {
    return res
      .status(404)
      .json({ success: false, message: 'Please provide a valid token' });
  }

  const user = await User.findById(userId);
  if (!user || user.referalTokenClaimed || user.referalToken === referalToken) {
    return res
      .status(404)
      .json({ success: false, message: 'You are not eligible for this' });
  }

  const transaction = new Transaction({
    user: userId,
    amount: 100,
    type: 'CREDIT',
    status: 'SUCCESS',
  });
  await transaction.save();

  let wallet = await Wallet.findOne({ user: userId });
  if (!wallet) {
    wallet = new Wallet({ user: userId, transactionHistory: [] });
  }
  wallet.transactionHistory.push(transaction._id);
  await wallet.save();

  user.referalTokenClaimed = true;
  existing.sharedReferals.push(userId);
  await existing.save();
  await user.save();

  res.status(200).json({
    success: true,
    message:
      'Reward claimed successfully! Check your wallet for the credited amount.',
  });
});
