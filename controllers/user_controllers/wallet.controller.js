import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import { Wallet } from '../../model/wallet.js';

const userMain = './layouts/user_main';
export const getWallet = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('success', 'Session expired!');
    return res.render('/profile');
  }
  const wallet = await Wallet.findOne({ user: userId }).populate(
    'transactionHistory'
  );
  console.log(wallet);

  res.render('user/wallet', {
    layout: userMain,
    wallet,
    transactions: wallet.transactionHistory,
  });
});
