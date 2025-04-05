import { Product } from '../../model/product_model.js';
import asyncHandler from 'express-async-handler';
import { Review } from '../../model/review.js';
import mongoose from 'mongoose';
import { Category } from '../../model/category_model.js';
import { Club } from '../../model/club_model.js';
import { productDetails } from '../../utilities/DbQueries.js';
const userMain = './layouts/user_main';

export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    categories, // Now supporting multiple categories
    club, // Club filter
    colors, // Colors filter
    sizes, // Sizes filter
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10,
  } = req.query;
  console.log(req.query);

  // Build query object
  const query = { is_deleted: false };

  // Search logic
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Category filtering (supporting multiple categories)
  if (categories) {
    const categoryArray = categories
      .split(',')
      .map(id => new mongoose.Types.ObjectId(id));
    query.category_id = { $in: categoryArray };
  }

  // Club filtering
  if (club) {
    query.club_id = new mongoose.Types.ObjectId(club);
  }

  // Color filtering (supporting multiple colors)
  if (colors) {
    const colorArray = colors.split(',');
    query.color = { $in: colorArray };
  }

  // Size filtering (supporting multiple sizes)
  if (sizes) {
    const sizeArray = sizes.split(',');
    query['sizes.size'] = { $in: sizeArray };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sorting logic
  const sortOptions = {
    priceLowToHigh: { discountedPrice: 1 },
    priceHighToLow: { discountedPrice: -1 },
    aToZ: { title: 1 },
    zToA: { title: -1 },
    recommended: { createdAt: -1 },
  };
  const sortCriteria = sortOptions[sort] || { createdAt: -1 };

  // Pagination
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // Fetch Products with filters, sorting, and pagination
  const products = await Product.aggregate([
    { $match: query },
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
        discountedPrice: {
          $subtract: [
            '$price',
            {
              $multiply: ['$price', { $divide: ['$discountPercentage', 100] }],
            },
          ],
        },
      },
    },
    { $sort: sortCriteria },
    { $skip: skip },
    { $limit: limitNumber },
    {
      $project: {
        title: 1,
        slug: 1,
        price: 1,
        description: 1,
        image_url: 1,
        category_id: 1,
        club_id: 1,
        colors: 1,
        sizes: 1,
        averageRating: 1,
        reviewCount: 1,
        discountPercentage: 1,
      },
    },
  ]);

  // Fetch Unique Colors from Products
  const uniqueColors = await Product.distinct('color');
  console.log(uniqueColors);

  // Fetch Categories & Clubs
  const categoriesList = await Category.find();
  const clubsList = await Club.find();

  // Fetch Total Product Count for Pagination
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.ceil(totalProducts / limitNumber);

  // Render Page
  res.render('user/productlist', {
    layout: userMain,
    css_file: 'products',
    js_file: 'products',
    products,
    currentPage: pageNumber,
    totalPages,
    totalProducts,
    limit,
    categories: categoriesList,
    clubs: clubsList,
    colors: uniqueColors,
  });
});

// Get Product Details
export const getProductDetails = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await Product.aggregate(productDetails(slug));
  if (!product.length) {
    return res.redirect('/products');
  }

  const categoriesList = await Category.find();
  const clubsList = await Club.find();
  console.log(product[0]);

  res.render('user/product_details', {
    layout: userMain,
    js_file: 'cart',
    categories: categoriesList,
    clubs: clubsList,
    product: product[0],
    alternativeProduct: product[0]?.alternativeProduct || null,
  });
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
