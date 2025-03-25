import asyncHandler from 'express-async-handler';

const userLogin = './layouts/user_login';

export const getLogin = asyncHandler(async (req, res) => {
  res.render('user/login', { layout: userLogin });
});
export const getSignup = asyncHandler(async (req, res) => {
  res.render('user/signup', { layout: userLogin });
});
