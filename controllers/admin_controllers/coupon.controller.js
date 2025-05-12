import asyncHandler from 'express-async-handler';
import { Coupon } from '../../model/coupon.js';
import { validateId } from '../../utilities/validateId.js';

export const fetchAllCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.render('admin/coupon', { coupons });
});

export const getCreateCoupon = asyncHandler(async (req, res) => {
  res.render('admin/add_coupons', { js_file: 'coupon' });
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
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    usageLimit: usageLimit || null,
  });
  await newCoupon.save();
  req.flash('success', 'Coupon created successfully');
  res.redirect('/admin/coupons');
});

export const getEditCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    req.flash('error', 'Invalid coupon');
    return res.redirect('/admin/coupons');
  }
  const coupon = await Coupon.findById(id);
  if (!coupon) {
    req.flash('error', 'Something went wrong');
    return res.redirect('/admin/coupon');
  }

  res.render('admin/edit_coupon', {
    js_file: 'coupon',
    coupon,
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
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
  } = req.body;
  if (!code || !discountType || !discountAmount || !startDate || !endDate) {
    req.flash('error', 'Field cannot be empty');
    return res.redirect(`/admin/coupons/edit/${id}`);
  }

  const existing = await Coupon.findOne({
    code: code.toUpperCase(),
    _id: { $ne: id },
  });
  if (existing) {
    req.flash('error', 'Coupon code Already exists');
    return res.redirect(`/admin/coupons/edit/${id}`);
  }

  const coupon = await Coupon.findById(id);
  if (!coupon) {
    req.flash('error', 'Coupon not Found');
    return res.redirect(`/admin/coupons/edit/${id}`);
  }
  coupon.code = code || coupon.code;
  coupon.description = description || coupon.description;
  coupon.discountType = discountType || coupon.discountType;
  coupon.discountAmount = discountAmount || coupon.discountAmount;
  coupon.isActive = isActive === 'on' || coupon.isActive;
  coupon.minimumPurchase = minimumPurchase || coupon.minimumPurchase;
  coupon.startDate = startDate || coupon.startDate;
  coupon.endDate = endDate || coupon.endDate;
  coupon.usageLimit = usageLimit || coupon.usageLimit;
  await coupon.save();
  req.flash('success', 'Coupon updated Successfully');
  res.redirect(`/admin/coupons/edit/${id}`);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    req.flash('error', 'Invalid Coupon');
    return res.redirect('/admin/coupons');
  }
  await Coupon.findByIdAndDelete(id);
  req.flash('success', 'Coupon deleted Successfully');
  res.redirect('/admin/coupons');
});
