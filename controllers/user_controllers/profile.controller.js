import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
const userMain = './layouts/user_main';

export const fetchDetails = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user);

  res.render('user/profile', { layout: userMain, user });
});
