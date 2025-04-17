import asyncHandler from 'express-async-handler';
import { Coupon } from '../../model/coupon.js';
import { User } from '../../model/user_model.js';
import { Cart } from '../../model/cart_model.js';

export const applyCoupon = asyncHandler(async (req, res) => {
  const { couponCode } = req.body;
  const userId = req.user._id;

  const coupon = await Coupon.findOne({ code: couponCode });
  if (!coupon || !coupon.isValid()) {
    req.flash('error', 'Invalid or expired coupon');
    return res.redirect('/checkout');
  }

  const user = await User.findById(userId);
  if (!user || user.couponApplied.includes(coupon._id)) {
    req.flash('error', 'Coupon already used or user not found');
    return res.redirect('/checkout');
  }

  const cart = await Cart.findOne({ userId });
  if (!cart || cart?.coupon?.toString() === coupon._id.toString()) {
    req.flash('error', 'Already in use');
    return res.redirect('/checkout');
  }
  if (cart.totalPrice < coupon.minimumPurchase) {
    req.flash('error', 'Invalid Coupon');
    return res.redirect('/checkout');
  }

  // Coupon amounts will be calculated in checkout Page

  cart.coupon = coupon._id;
  await cart.save();
  await user.save();

  req.flash('success', 'Coupon applied successfully');
  return res.redirect('/checkout');
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const user = await User.findById(userId);

  const cart = await Cart.findOne({ userId });

  if (!cart || !cart.coupon) {
    req.flash('error', 'You dont have any coupon');
    return res.redirect('/checkout');
  }
  user.couponApplied.pull(cart.coupon);

  cart.coupon = null;
  cart.couponDiscount = 0;

  await user.save();
  await cart.save();
  req.flash('success', 'Coupon removed');
  return res.redirect('/checkout');
});
