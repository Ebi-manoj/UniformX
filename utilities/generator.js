import { transporter } from '../config/nodemailer.js';
import { User } from '../model/user_model.js';

export const generateOTP = function () {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const generateExpiry = function () {
  return new Date(Date.now() + 2 * 60 * 1000);
};

export const sendOTP = async function (email, otp) {
  return transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify Your Email - OTP',
    text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
  });
};

export const generateReferralToken = async () => {
  let token;
  let exists = true;

  while (exists) {
    const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
    token = `UNI${randomNum}`;
    const existingUser = await User.findOne({ referralToken: token });
    if (!existingUser) exists = false;
  }

  return token;
};
