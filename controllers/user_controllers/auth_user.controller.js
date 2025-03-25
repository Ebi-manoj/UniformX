import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import { OTP } from '../../model/otp_model.js';
import {
  generateExpiry,
  generateOTP,
  sendOTP,
} from '../../utilities/generator.js';

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
  if (!req.session.signupData) {
    req.flash('error', 'Session expired. Please sign up again.');
    return res.redirect('/auth/signup');
  }

  const { email } = req.session.signupData;
  // Fetch the latest OTP entry for the user
  const otpEntry = await OTP.findOne({ email });

  if (!otpEntry) {
    req.flash('error', 'An error occured');
    res.redirect('/auth/signup');
  }
  res.render('user/otp', {
    layout: userLogin,
    js_file: 'auth',
    expiresAt: otpEntry.expiresAt,
  });
});

/////////////////////////////////////////////
//signup Handler
export const signUpHandler = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile) {
    req.flash('error', 'All fields are required');
    return res.redirect('/auth/signup');
  }
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'User Already exists');
      return res.redirect('/auth/signup');
    }

    req.session.signupData = { name, email, password, mobile };

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = generateExpiry();

    await OTP.deleteMany({ email, purpose: 'signup' });

    // Save OTP
    await new OTP({
      email,
      otp,
      purpose: 'signup',
      expiresAt,
    }).save();

    // Send OTP email
    await sendOTP(email, otp);

    // Redirect to OTP verification page
    res.redirect('/auth/verify-otp');
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////
///OTP Verification

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const otp = req.body.otp;
  const { email } = req.session.signupData;
  console.log('session data', req.session.signupData);

  if (!email || !otp) {
    req.flash('error', 'Invalid OTP request');
    req.session.save(() => {
      return res.redirect('/auth/verify-otp');
    });
  }

  try {
    const otpEntry = await OTP.findOne({ email, purpose: 'signup' });

    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      req.flash('error', 'OTP expired. Please request a new one.');
      return res.redirect('/auth/signup');
    }

    if (otpEntry.otp !== otp) {
      req.flash('error', 'Invalid OTP. Please try again.');
      return res.redirect('/auth/verify-otp');
    }

    // If OTP is correct, create user from session data
    if (!req.session.signupData) {
      req.flash('error', 'Session expired. Please sign up again.');
      return res.redirect('/auth/signup');
    }

    const { name, password, mobile } = req.session.signupData;

    // Save user to database
    const user = new User({
      full_name: name,
      email,
      password,
      phone: mobile,
      isVerified: true,
    });

    await user.save();

    // Clear OTP and session data
    await OTP.deleteMany({ email, purpose: 'signup' });
    req.session.signupData = null;

    req.flash('success', 'Signup successful. Please log in.');
    res.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
});
