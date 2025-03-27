import { Product } from '../../model/product_model.js';
import asyncHandler from 'express-async-handler';
import { Review } from '../../model/review.js';
import mongoose from 'mongoose';
import { Category } from '../../model/category_model.js';
import { Club } from '../../model/club_model.js';
const userMain = './layouts/user_main';

export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

  // Build query object
  const query = {
    is_deleted: false,
  };

  // Search logic
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filter
  if (category) {
    query.category_id = mongoose.Types.ObjectId(category);
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting logic
  const sortOptions = {
    'price-asc': { price: 1 },
    'price-desc': { price: -1 },
    'name-asc': { title: 1 },
    'name-desc': { title: -1 },
  };

  const sortCriteria = sortOptions[sort] || { createdAt: -1 };

  // Pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Aggregation pipeline for comprehensive product listing
  const products = await Product.aggregate([
    { $match: query },
    // Lookup reviews for rating and review count
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product_id',
        as: 'reviews',
      },
    },
    // Calculate average rating and review count
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    // Sort
    { $sort: sortCriteria },
    // Pagination
    { $skip: skip },
    { $limit: limitNumber },
    // Project only needed fields
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

  // Get total count for pagination
  const totalProducts = await Product.countDocuments(query);
  const categories = await Category.find();
  const clubs = await Club.find();

  res.render('user/productlist', {
    layout: userMain,
    css_file: 'products',
    js_file: 'products',
    products,
    currentPage: pageNumber,
    totalPages: Math.ceil(totalProducts / limitNumber),
    totalProducts,
    limit,
    categories,
    clubs,
  });
});

// Get Product Details
export const getProductDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.aggregate([
    { $match: { slug, is_deleted: false } },
    // Lookup category details
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    // Lookup reviews
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'product_id',
        as: 'reviews',
      },
    },
    // Unwind category (optional, depends on your schema)
    { $unwind: '$category' },
    // Calculate ratings
    {
      $addFields: {
        averageRating: { $avg: '$reviews.rating' },
        reviewCount: { $size: '$reviews' },
      },
    },
    // Project needed fields
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        description: 1,
        image_url: 1,
        category: 1,
        sizes: 1,
        color: 1,
        averageRating: 1,
        reviewCount: 1,
        reviews: 1,
      },
    },
  ]);

  if (!product.length) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product[0]);
});

// Add Review
export const addReview = asyncHandler(async (req, res) => {
  const { product_id } = req.params;
  const { rating, review_text } = req.body;
  const user_id = req.user._id; // Assuming authentication middleware

  const review = new Review({
    product_id,
    user_id,
    rating,
    review_text,
    verified_purchase: false, // You'd implement actual verification logic
  });

  await review.save();

  res.status(201).json({ message: 'Review added successfully', review });
});

// Get Product Reviews
export const getProductReviews = asyncHandler(async (req, res) => {
  const { product_id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const reviews = await Review.aggregate([
    {
      $match: {
        product_id: mongoose.Types.ObjectId(product_id),
        is_active: true,
      },
    },
    // Lookup user details
    {
      $lookup: {
        from: 'users',
        localField: 'user_id',
        foreignField: '_id',
        as: 'user',
      },
    },
    { $unwind: '$user' },
    // Sort by most recent
    { $sort: { createdAt: -1 } },
    // Pagination
    { $skip: (page - 1) * limit },
    { $limit: Number(limit) },
    // Project needed fields
    {
      $project: {
        rating: 1,
        review_text: 1,
        images: 1,
        createdAt: 1,
        'user.full_name': 1,
        'user.avatar': 1,
      },
    },
  ]);

  const totalReviews = await Review.countDocuments({
    product_id: mongoose.Types.ObjectId(product_id),
    is_active: true,
  });

  res.json({
    reviews,
    currentPage: page,
    totalPages: Math.ceil(totalReviews / limit),
    totalReviews,
  });
});
