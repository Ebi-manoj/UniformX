import asyncHandler from 'express-async-handler';
import { Product } from '../../model/product_model.js';
import { Category } from '../../model/category_model.js';
import { Club } from '../../model/club_model.js';

export const getProducts = asyncHandler(async (req, res) => {
  const page = req.params.page || 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search || '';
  let query = {};

  if (req.query.category) {
    query.category_id = req.query.category;
  }
  if (req.query.club) {
    query.club_id = req.query.club;
  }
  if (req.query.stock === 'instock') {
    query.$expr = {
      $gt: [{ $sum: '$sizes.stock_quantity' }, 0],
    };
  } else if (req.query.stock === 'outstock') {
    query.$expr = {
      $lt: [{ $sum: '$sizes.stock_quantity' }, 1],
    };
  }
  if (searchQuery) {
    query.title = { $regex: searchQuery, $options: 'i' };
  }
  const totalCount = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  const products = await Product.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category_id', 'name')
    .populate('club_id', 'name');

  const categories = await Category.find({}, 'name');
  const clubs = await Club.find({}, 'name');

  res.render('admin/product', {
    cssFile: null,
    js_file: 'product',
    products,
    categories,
    clubs,
    currentPage: page,
    totalPages,
    totalCount,
    searchQuery,
    limit,
  });
});

export const addProducts = asyncHandler(async (req, res) => {
  console.log(req.body);
  console.log(req.files);

  // Extract and transform sizes from req.body
  const sizes = [];
  if (req.body.sizesSize && req.body.sizesStock) {
    // If sizes are sent as single values (not arrays), wrap them
    const sizeValues = Array.isArray(req.body.sizesSize)
      ? req.body.sizesSize
      : [req.body.sizesSize];
    const stockValues = Array.isArray(req.body.sizesStock)
      ? req.body.sizesStock
      : [req.body.sizesStock];

    // Combine into array of objects
    for (let i = 0; i < sizeValues.length; i++) {
      sizes.push({
        size: sizeValues[i],
        stock_quantity: parseInt(stockValues[i], 10),
      });
    }
  }

  // Map image URLs from req.files (Cloudinary response)
  const imageUrls = req.files ? req.files.map(file => file.path) : [];

  // Create new product object matching the schema
  const newProduct = new Product({
    title: req.body.title,
    price: parseFloat(req.body.price),
    description: req.body.description,
    color: req.body.customColorName,
    sizes,
    category_id: req.body.category_id,
    club_id: req.body.club_id,
    type: req.body.type,
    image_url: imageUrls,
  });

  const savedProduct = await newProduct.save();
  console.log(savedProduct);
  req.flash('success', 'Product added Successfully');
  res.redirect('/admin/products');
});
