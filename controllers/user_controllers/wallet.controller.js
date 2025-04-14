import asyncHandler from 'express-async-handler';

const userMain = './layouts/user_main';
export const getWallet = asyncHandler(async (req, res) => {
  res.render('user/wallet', { layout: userMain });
});
