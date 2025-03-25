import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import { OTP } from '../../model/otp_model.js';
import {
  generateExpiry,
  generateOTP,
  sendOTP,
} from '../../utilities/generator.js';
import { generateToken } from '../../config/jwt.js';

const userLogin = './layouts/user_login';

export const getLogin = asyncHandler(async (req, res) => {
  if (req.cookies.token) return res.redirect('/');
  res.render('user/login', { layout: userLogin, js_file: 'auth' });
});
export const getSignup = asyncHandler(async (req, res) => {
  res.render('user/signup', { layout: userLogin, js_file: 'auth' });
});
export const getHome = asyncHandler(async (req, res) => {
  if (!req.cookies.token) return res.redirect('/auth/login');
  res.send('Home Page');
});
export const getForgotPassword = asyncHandler(async (req, res) => {
  res.render('user/forgot_password', { layout: userLogin, js_file: 'auth' });
});

////////////////////////////////////////////////////
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
    res.redirect('/auth/verify-otp?purpose=signup');
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////
///OTP Verification

export const verifyOTP = asyncHandler(async (req, res, next) => {
  const otp = req.body.otp;
  const { email } = req.session.signupData;
  const { purpose } = req.query;
  console.log('session data', req.session.signupData);

  if (!email || !otp || !purpose) {
    req.flash('error', 'Invalid OTP request');
    req.session.save(() => {
      return res.redirect(`/auth/verify-otp/${purpose}`);
    });
  }

  try {
    const otpEntry = await OTP.findOne({ email, purpose });

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

///////////////////////////////////////////////////////
///Resend OTP
export const resendOTP = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.session.signupData || {};

    if (!email) {
      req.flash('error', 'Session expired. Please restart the signup process.');
      return res.redirect('/auth/signup');
    }

    // Generate new OTP and expiry
    const otp = generateOTP();
    const expiresAt = generateExpiry();

    // Remove any previous OTPs for this email (signup purpose)
    await OTP.deleteMany({ email, purpose: 'signup' });

    // Save new OTP in the database
    await new OTP({
      email,
      otp,
      purpose: 'signup',
      expiresAt,
    }).save();

    // Send OTP email
    await sendOTP(email, otp);

    req.flash('success', 'A new OTP has been sent to your email.');
    res.redirect('/auth/verify-otp');
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////
/////Login Handler

export const LoginHandler = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    req.flash('error', 'Email and Password required');
    return res.redirect('/auth/login');
  }
  const user = await User.findOne({ email });
  if (!user) {
    req.flash('error', 'Invalid Credintials!');
    return res.redirect('/auth/login');
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    req.flash('error', 'Invalid Credintials!');
    return res.redirect('/auth/login');
  }
  const token = generateToken(user._id);

  res.cookie('token', token, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.redirect('/');
});

/////////////////////////////////////////////////////////////////////
////////Forgot Password
