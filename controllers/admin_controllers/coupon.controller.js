import asyncHandler from 'express-async-handler';
import { Coupon } from '../../model/coupon.js';
import { Product } from '../../model/product_model.js';
import { Category } from '../../model/category_model.js';

export const fetchAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.render('admin/coupon', { coupons });
});

export const getCreateCoupon = asyncHandler(async (req, res) => {
  const products = await Product.find().select('title _id');
  const categories = await Category.find().select('name _id');
  res.render('admin/add_coupons', { js_file: 'coupon', products, categories });
});

export const addCoupons = asyncHandler(async (req, res) => {
  const {
    code,
    description,
    discountType,
    discountAmount,
    isActive,
    minimumPurchase,
    startDate,
    endDate,
    usageLimit,
    applicableProducts,
    applicableCategories,
  } = req.body;

  if (
    !code ||
    !description ||
    !discountType ||
    !discountAmount ||
    !startDate ||
    !endDate
  ) {
    req.flash('error', 'Please fill all required fields');
    return res.redirect('/admin/coupons/create');
  }

  const existing = await Coupon.findOne({ code: code.toUpperCase() });
  if (existing) {
    req.flash('success', 'Already Existing Coupon');
    return res.redirect('/admin/coupons/create');
  }

  const newCoupon = new Coupon({
    code,
    description,
    isActive: isActive === 'on',
    discountType,
    discountAmount,
    minimumPurchase: minimumPurchase || 0,
    startDate,
    endDate,
    usageLimit: usageLimit || null,
    applicableProducts: applicableProducts || [],
    applicableCategories: applicableCategories || [],
  });
  await newCoupon.save();
  req.flash('success', 'Coupon created successfully');
  res.redirect('/admin/coupons/create');
});
