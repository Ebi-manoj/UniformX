import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import Address from '../../model/address.js';
const userMain = './layouts/user_main';

export const fetchDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  const addresses = await Address.find({ userId: user._id });
  const defaultAddress = addresses.find(addr => addr.is_default === true);
  console.log(addresses);
  console.log(defaultAddress);

  res.render('user/profile', {
    layout: userMain,
    user,
    addresses,
    defaultAddress,
  });
});

export const fetchAddress = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const addresses = await Address.find({ userId: id });
  res.render('user/address', {
    js_file: 'profile',
    layout: userMain,
    addresses,
  });
});
