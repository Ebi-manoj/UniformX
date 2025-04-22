import asyncHandler from 'express-async-handler';
import { Offer } from '../../model/offer.js';
import { Product } from '../../model/product_model.js';
import { Category } from '../../model/category_model.js';
import { validateId } from '../../utilities/validateId.js';

export const fetchAllOffers = asyncHandler(async (req, res) => {
  const offers = await Offer.find()
    .populate('product', 'name')
    .populate('category', 'name');

  res.render('admin/offer', { js_file: 'offer', offers });
});

export const fetchOffer = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id))
    return res.status(404).json({ success: false, message: 'Offer not found' });
  const offer = await Offer.findById(id);
  const products = await Product.find().select('_id title');
  const categories = await Category.find().select('_id name');
  res.status(200).json({ success: true, offer, products, categories });
});

export const getAddOffer = asyncHandler(async (req, res) => {
  const products = await Product.find().select('_id title');
  const categories = await Category.find().select('_id name');
  res.render('admin/add_offers', { js_file: 'offer', products, categories });
});

export const addOffer = asyncHandler(async (req, res) => {
  console.log(req.body);
  const {
    name,
    type,
    discountPercentage,
    validFrom,
    validTo,
    products,
    categories,
  } = req.body;
  if (!name || !type || !discountPercentage) {
    req.flash('error', 'Field cannot be empty');
    res.redirect('/admin/offers/add');
  }

  if (!products && !categories) {
    req.flash('error', 'Select atleast one Product or category');
    res.redirect('/admin/offers/add');
  }

  const offer = new Offer({
    offerName: name || 'unknown',
    type,
    discountPercentage,
    validFrom: new Date(validFrom),
    validTo: new Date(validTo),
  });
  offer.product = type === 'product' ? products || null : null;
  offer.category = type === 'category' ? categories || null : null;

  await offer.save();
  req.flash('success', 'Offer added successfully');
  res.redirect('/admin/offer-management');
});

export const editOffer = asyncHandler(async (req, res) => {
  const {
    offerId,
    name,
    type,
    products,
    categories,
    discountPercentage,
    validFrom,
    validTo,
    isActive,
  } = req.body;
  if (!validateId(offerId)) {
    req.flash('error', 'Invalid Offer details');
    return res.redirect('/admin/offer-management');
  }
  const offer = await Offer.findById(offerId);
  if (!offer) {
    req.flash('error', 'Invalid Offer details');
    return res.redirect('/admin/offer-management');
  }

  offer.offerName = name || offer.offerName;
  offer.type = type || offer.type;
  offer.discountPercentage = discountPercentage || offer.discountPercentage;

  if (validFrom && !isNaN(new Date(validFrom))) {
    offer.validFrom = new Date(validFrom);
  }
  if (validTo && !isNaN(new Date(validTo))) {
    offer.validTo = new Date(validTo);
  }

  offer.isActive = isActive === 'on' || offer.isActive;

  offer.product = type === 'product' ? products || offer.product : null;
  offer.category = type === 'category' ? categories || offer.category : null;

  await offer.save();

  req.flash('success', 'Offer updated successfully');
  return res.redirect('/admin/offer-management');
});
