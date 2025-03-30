import asyncHandler from 'express-async-handler';
import { Product } from '../../model/product_model.js';
import { Category } from '../../model/category_model.js';
import { Club } from '../../model/club_model.js';
import { generateSlug } from '../../utilities/slugify.js';
import { validateId } from '../../utilities/validateId.js';
import { cloudinary } from '../../config/cloudinary.js';

export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
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
  const clubs = await Club.find({}, 'category_id name');

  res.render('admin/product', {
    css_file: null,
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

export const addProducts = asyncHandler(async (req, res, next) => {
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
  let slug;
  try {
    slug = await generateSlug(req.body.title);
  } catch (error) {
    next(error);
  }

  // Create new product object matching the schema
  const newProduct = new Product({
    title: req.body.title,
    slug,
    price: parseFloat(req.body.price),
    description: req.body.description,
    color: req.body.customColorName,
    sizes,
    discountPercentage: req.body.discountPercentage
      ? parseFloat(req.body.discountPercentage)
      : null,
    category_id: req.body.category_id,
    club_id: req.body.club_id,
    type: req.body.type,
    image_url: imageUrls,
  });

  const savedProduct = await newProduct.save();
  res.status(201).json({
    message: 'Product added successfully',
    product: savedProduct,
  });
});

export const getEditProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    return res.status(404).json({ error: 'Not Valid Id' });
  }
  const product = await Product.findById(id)
    .populate('category_id', 'name')
    .populate('club_id', 'name');
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  console.log('yess');
  res.json(product);
});

// Update Product

export const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  // Update fields
  product.title = req.body.title || product.title;
  product.price = req.body.price ? parseFloat(req.body.price) : product.price;
  product.description = req.body.description || product.description;
  product.color = req.body.customColorName || product.color;
  product.type = req.body.type || product.type;
  product.category_id = req.body.category_id || product.category_id;
  product.club_id = req.body.club_id || product.club_id;
  product.discountPercentage =
    parseFloat(req.body.discountPercentage) || product.discountPercentage;

  // Update sizes
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
  product.sizes = sizes ?? product.sizes;

  // Update images if new ones are uploaded
  if (req.files && req.files.length > 0) {
    if (product.image_url && product.image_url.length > 0) {
      for (const url of product.image_url) {
        const publicId = url.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`uniformx/products/${publicId}`);
      }
    }
    product.image_url = req.files.map(file => file.path);
  }

  // Regenerate slug if title changed
  if (req.body.title && req.body.title !== product.title) {
    product.slug = await generateSlug(req.body.title);
  }

  const updatedProduct = await product.save();
  console.log('hai');

  res.json({
    message: 'Product updated successfully',
    product: updatedProduct,
  });
});

export const toggleProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ message: 'Product Not found' });

  product.is_deleted = !product.is_deleted;
  await product.save();
  res.status(200).json({ success: true });
});
