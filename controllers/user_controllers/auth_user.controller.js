import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import { OTP } from '../../model/otp_model.js';
import { transporter } from '../../config/nodemailer.js';

const userLogin = './layouts/user_login';

export const getLogin = asyncHandler(async (req, res) => {
  res.render('user/login', { layout: userLogin, js_file: 'auth' });
});
export const getSignup = asyncHandler(async (req, res) => {
  res.render('user/signup', { layout: userLogin, js_file: 'auth' });
});
export const getHome = asyncHandler(async (req, res) => {
  if (!req.cookies.token) return res.redirect('/auth/login');
  res.send('Home Page');
});
// Get verify OTP page
export const getVerifyOTP = asyncHandler(async (req, res) => {
  res.render('user/otp', { layout: userLogin, js_file: 'auth' });
});

//signup Handler
export const signUpHandler = asyncHandler(async (req, res) => {
  console.log(req.body);
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile) {
    req.flash('error', 'All fields are required');
    return res.redirect('/auth/signup');
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    req.flash('error', 'User Already exists');
    return res.redirect('/auth/signup');
  }

  // Create new user (not verified yet)
  const user = new User({
    full_name: name,
    email,
    password,
    phone: mobile,
    isVerified: false,
  });
  await user.save();

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Expires in 10 minutes

  // Save OTP
  await new OTP({
    userId: user._id,
    otp,
    purpose: 'signup',
    expiresAt,
  }).save();

  // Send OTP email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - OTP',
    text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
  });

  // Redirect to OTP verification page
  res.redirect(`/auth/verify-otp?email=${email}`);
});
