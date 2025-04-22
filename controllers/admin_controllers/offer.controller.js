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
    product: products || null,
    category: categories || null,
  });
  await offer.save();
  req.flash('success', 'Offer added successfully');
  res.redirect('/admin/offer-management');
});
