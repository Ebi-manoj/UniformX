import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';
import { OTP } from '../../model/otp_model.js';
import { Category } from '../../model/category_model.js';
import {
  generateExpiry,
  generateOTP,
  generateReferralToken,
  sendOTP,
} from '../../utilities/generator.js';
import { generateToken } from '../../config/jwt.js';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Club } from '../../model/club_model.js';
import { Product } from '../../model/product_model.js';

const userLogin = './layouts/user_login';
const userMain = './layouts/user_main';

export const getLogin = asyncHandler(async (req, res) => {
  if (req.cookies.token) return res.redirect('/');
  res.render('auth/login', { layout: userLogin });
});
export const getSignup = asyncHandler(async (req, res) => {
  res.render('auth/signup', { layout: userLogin });
});

export const getForgotPassword = asyncHandler(async (req, res) => {
  res.render('auth/forgot_password', { layout: userLogin });
});
export const getResetPassword = asyncHandler(async (req, res) => {
  res.render('auth/reset_password', { layout: userLogin });
});

////////////////
//Get about
export const getAbout = asyncHandler(async (req, res) => {
  res.render('user/about', { layout: userMain });
});

//////////////////
//Get contact
export const getContact = asyncHandler(async (req, res) => {
  res.render('user/contact', { layout: userMain });
});

///////////////////////////////////////////////
//Get Home
export const getHome = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  const clubs = await Club.find();
  const bestSelling = await Product.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    { $sort: { price: -1 } },
    { $limit: 4 },
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        description: 1,
        image_url: 1,
        category_id: 1,
        averageRating: 1,
        reviewCount: 1,
        discountPercentage: 1,
      },
    },
  ]);
  const features = await Product.aggregate([
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product_id',
        as: 'reviews',
      },
    },
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    { $sort: { createdAt: -1 } },
    { $limit: 4 },
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        description: 1,
        image_url: 1,
        category_id: 1,
        averageRating: 1,
        reviewCount: 1,
        discountPercentage: 1,
      },
    },
  ]);

  res.render('user/home', {
    css_file: null,
    js_file: 'home',
    layout: userMain,
    categories,
    clubs,
    bestSelling,
    features,
    referalClaimed: req.user?.referalTokenClaimed,
  });
});
////////////////////////////////////////////////////
// Get verify OTP page
export const getVerifyOTP = asyncHandler(async (req, res) => {
  const { purpose } = req.query;

  // Determine which session data to use based on the purpose
  let email;
  if (purpose === 'signup' && req.session.signupData) {
    email = req.session.signupData.email;
  } else if (purpose === 'reset-password' && req.session.resetEmail) {
    email = req.session.resetEmail;
  } else {
    req.flash('error', 'Session expired. Please request OTP again.');
    return res.redirect(
      purpose === 'signup' ? '/auth/signup' : '/auth/forgot-password'
    );
  }

  // Fetch the latest OTP entry for the user
  const otpEntry = await OTP.findOne({ email, purpose });

  if (!otpEntry) {
    req.flash('error', 'An error occurred. Please request a new OTP.');
    return res.redirect(
      purpose === 'signup' ? '/auth/signup' : '/auth/forgot-password'
    );
  }

  res.render('auth/otp', {
    layout: userLogin,
    js_file: 'auth',
    expiresAt: otpEntry.expiresAt,
    purpose,
  });
});

/////////////////////////////////////////////
//signup Handler
export const signUpHandler = asyncHandler(async (req, res, next) => {
  const { name, email, password, mobile } = req.body;

  if (!name || !email || !password || !mobile) {
    req.flash('error', 'All fields are required');
    return res.redirect('/auth/signup');
  }
  try {
    const existingUser = await User.findOne({
      $or: [{ email }, { phone: mobile }],
    });
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
    console.log(`Otp sent:${otp}`);

    // Redirect to OTP verification page
    res.redirect('/auth/verify-otp?purpose=signup');
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////
///OTP Verification
export const verifyOTP = asyncHandler(async (req, res, next) => {
  try {
    const { otp } = req.body;
    const { purpose } = req.query;

    if (!purpose || !otp) {
      req.flash('error', 'Invalid OTP request');
      return res.redirect('/auth/verify-otp?purpose=signup');
    }

    let email;

    // Handle Signup OTP verification
    if (purpose === 'signup') {
      if (!req.session.signupData) {
        req.flash('error', 'Session expired. Please sign up again.');
        return res.redirect('/auth/signup');
      }
      email = req.session.signupData.email;
    }

    // Handle Reset Password OTP verification
    if (purpose === 'reset-password') {
      if (!req.session.resetEmail) {
        req.flash('error', 'Session expired. Please request OTP again.');
        return res.redirect('/auth/forgot-password');
      }
      email = req.session.resetEmail;
    }

    const otpEntry = await OTP.findOne({ email, purpose });

    if (!otpEntry || otpEntry.expiresAt < new Date()) {
      req.flash('error', 'OTP expired. Please request a new one.');
      return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
    }

    if (otpEntry.otp !== otp) {
      req.flash('error', 'Invalid OTP. Please try again.');
      return res.redirect(`/auth/verify-otp?purpose=${purpose}`);
    }

    // OTP Verified - Handle based on purpose
    if (purpose === 'signup') {
      const { name, password, mobile } = req.session.signupData;
      const referalToken = await generateReferralToken();

      const user = new User({
        full_name: name,
        email,
        password,
        phone: mobile,
        referalToken,
      });

      await user.save();

      // Clear OTP and session data
      await OTP.deleteMany({ email, purpose });
      req.session.signupData = null;

      req.flash('success', 'Signup successful. Please log in.');
      return res.redirect('/auth/login');
    }

    if (purpose === 'reset-password') {
      req.session.isVerifiedForReset = true;

      // Clear OTP entry after verification
      await OTP.deleteMany({ email, purpose });

      req.flash('success', 'OTP verified. Please reset your password.');
      return res.redirect('/auth/reset-password');
    }
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
    console.log(`Resend Otp sent:${otp}`);

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
  if (user.is_blocked) {
    req.flash('error', 'Your account has been blocked. Contact admin.');
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
export const forgotPasswordHandler = asyncHandler(async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      req.flash('error', 'Email is required');
      return res.redirect('/auth/forgot-password');
    }

    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'No account found with this email');
      return res.redirect('/auth/forgot-password');
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = generateExpiry();

    // Delete existing OTPs for the email
    await OTP.deleteMany({ email, purpose: 'reset-password' });
    console.log(`Forgot Otp:${otp}`);

    // Save OTP to the database
    await new OTP({
      email,
      otp,
      purpose: 'reset-password',
      expiresAt,
    }).save();

    // Send OTP email
    await sendOTP(email, otp);
    // Store email in session for verification
    req.session.resetEmail = email;

    req.session.save(() => {
      req.flash('success', 'OTP sent to your email. Please verify.');
      return res.redirect('/auth/verify-otp?purpose=reset-password');
    });
  } catch (error) {
    next(error);
  }
});

/////////////////////////////////////////////////////////
///////////Reset Password

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    if (!req.session.isVerifiedForReset) {
      req.flash('error', 'Session expired. Request a new one!');
      return res.redirect('/auth/forgot-password');
    }

    const { newPassword, confirmPassword } = req.body;

    // Validate input
    if (!newPassword || !confirmPassword) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/auth/reset-password');
    }

    if (newPassword !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/auth/reset-password');
    }

    // Get the user's email from session
    const email = req.session.resetEmail;
    const user = await User.findOne({ email });

    if (!user) {
      req.flash('error', 'User not found.');
      return res.redirect('/auth/reset-password');
    }

    user.password = confirmPassword;
    await user.save();

    // Clear session data related to reset verification
    req.session.isVerifiedForReset = null;
    req.session.resetEmail = null;

    req.flash('success', 'Password reset successful. Please log in.');
    return res.redirect('/auth/login');
  } catch (error) {
    next(error);
  }
});

//////////////////////////////////////////////////////////////////////////
///Google Authentication

// Google OAuth Strategy Configuration
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.CALLBACK_URI,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({
          $or: [{ googleId: profile.id }, { email: profile.emails[0].value }],
        });

        if (!user) {
          user = new User({
            full_name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            phone: profile.id,
          });

          await user.save();
        } else if (!user.googleId) {
          user.googleId = profile.id;
          await user.save();
        }
        if (user.is_blocked) {
          return done(null, false, {
            message: 'Your account has been blocked. Contact admin.',
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// Google Login Route Handler
export const googleLogin = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

// Google Callback Route Handler
export const googleCallback = asyncHandler(async (req, res, next) => {
  passport.authenticate('google', async (err, user, info) => {
    if (err) {
      req.flash('error', 'Authentication failed!');
      return res.redirect('/auth/login');
    }

    if (!user) {
      req.flash('error', info?.message || 'User not found');
      return res.redirect('/auth/login');
    }

    // Generate JWT token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.redirect('/');
  })(req, res, next);
});

export const userLogout = asyncHandler(async (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'strict',
  });
  res.redirect('/');
});
