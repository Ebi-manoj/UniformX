import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import { Wallet } from '../../model/wallet.js';

const userMain = './layouts/user_main';
export const getWallet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  const page = parseInt(req.query?.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  if (!validateId(userId)) {
    req.flash('success', 'Session expired!');
    return res.redirect('/profile');
  }

  let wallet = await Wallet.findOne({ user: userId }).populate({
    path: 'transactionHistory',
    options: {
      sort: { createdAt: -1 },
      skip,
      limit,
    },
  });

  if (!wallet) {
    wallet = new Wallet({ user: userId, transactionHistory: [] });
    await wallet.save();
  }
  const walletCount = await Wallet.findOne({ user: userId }).lean();
  const totalTransactions = walletCount.transactionHistory.length;
  const totalPages = Math.ceil(totalTransactions / limit);
  const pagination = {
    currentPage: page,
    totalPages,
    limit,
    totalTransactions,
  };

  res.render('user/wallet', {
    js_file: 'wallet',
    layout: userMain,
    wallet,
    transactions: wallet.transactionHistory,
    pagination: {
      currentPage: page,
      totalPages,
      limit,
      totalTransactions,
    },
  });
});
