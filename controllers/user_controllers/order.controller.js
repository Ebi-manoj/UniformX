import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import Address from '../../model/address.js';

const userMain = './layouts/user_main';

export const getCheckout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('error', 'session expired!');
    return res.redirect('/cart');
  }
  const addresses = await Address.find({ userId });
  res.render('user/checkout', {
    js_file: 'checkout',
    layout: userMain,
    addresses,
  });
});
