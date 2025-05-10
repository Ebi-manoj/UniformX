import { Product } from '../../model/product_model.js';
import asyncHandler from 'express-async-handler';
import { Review } from '../../model/review.js';
import mongoose from 'mongoose';
import { Category } from '../../model/category_model.js';
import { Club } from '../../model/club_model.js';
import { productDetails } from '../../utilities/DbQueries.js';
import { Wishlist } from '../../model/wishlist.js';
import { Order } from '../../model/order_model.js';
import { validateId } from '../../utilities/validateId.js';
const userMain = './layouts/user_main';

export const listProducts = asyncHandler(async (req, res) => {
  const {
    search,
    categories,
    club,
    colors,
    sizes,
    minPrice,
    maxPrice,
    sort,
    page = 1,
    limit = 10,
  } = req.query;

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
    // lookup for category
    {
      $lookup: {
        from: 'categories',
        localField: 'category_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: '$category' },
    //lookup for club
    {
      $lookup: {
        from: 'clubs',
        localField: 'club_id',
        foreignField: '_id',
        as: 'club',
      },
    },
    { $unwind: '$club' },
    // listing only club and catgeories active
    {
      $match: {
        'category.isActive': true,
        'club.isActive': true,
      },
    },
    // discount price
    {
      $addFields: {
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
        discountPercentage: 1,
        averageRating: 1,
        numReviews: 1,
      },
    },
  ]);

  // Fetch Unique Colors from Products
  const uniqueColors = await Product.distinct('color');

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
  const userId = req.user?._id;

  const product = await Product.aggregate(productDetails(slug));
  if (!product.length) {
    return res.redirect('/products');
  }
  //checking wishlisted true
  const wishlist = await Wishlist.findOne({ userId });
  let isWishlisted;
  if (wishlist) {
    isWishlisted = wishlist.items.some(
      item => item.productId.toString() === product[0]._id.toString()
    );
  }

  const categoriesList = await Category.find();
  const clubsList = await Club.find();

  const reviews = await Review.find({ product: product[0]._id })
    .populate('user', 'full_name')
    .sort({ createdAt: -1 });

  const formattedReviews = reviews.map(r => ({
    name: r.user.full_name,
    initials: r.user.full_name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase(),
    rating: r.rating,
    comment: r.comment,
    date: new Date(r.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
  }));

  //checking the userCan write the review or not
  let hasReviewed = false;
  let hasPurchased = false;

  const existed = await Review.findOne({
    user: userId,
    product: product[0]._id,
  });

  hasReviewed = !!existed;

  const order = await Order.find({
    user: userId,
    items: {
      $elemMatch: {
        product: product[0]._id,
        status: { $in: ['DELIVERED', 'RETURNED'] },
      },
    },
  });

  hasPurchased = !!order.length;

  res.render('user/product_details', {
    layout: userMain,
    js_file: 'cart',
    categories: categoriesList,
    isWishlisted,
    clubs: clubsList,
    product: product[0],
    alternativeProduct: product[0]?.alternativeProduct || null,
    reviews: formattedReviews,
    writeReview: hasPurchased && !hasReviewed,
  });
});

export const addReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { rating, comment } = req.body;
  if (!rating || !comment) {
    return res
      .status(404)
      .json({ success: false, message: 'Field cannot be empty' });
  }
  const userId = req.user?._id;
  if (!validateId(userId)) {
    return res.status(401).json({ success: false, message: 'Session expired' });
  }

  if (!validateId(productId))
    return res.status(404).json({ success: false, message: 'Invalid Product' });

  const order = await Order.find({
    user: userId,
    items: {
      $elemMatch: {
        product: productId,
        status: { $in: ['DELIVERED', 'RETURNED'] },
      },
    },
  });

  if (order.length === 0) {
    return res
      .status(401)
      .json({ success: false, message: 'You dont have the permission' });
  }

  const review = new Review({
    user: userId,
    product: productId,
    comment,
    rating,
  });

  await review.save();
  const allReviews = await Review.find({ product: productId });
  const averageRating = allReviews.length
    ? (
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
      ).toFixed(1)
    : 0;

  const product = await Product.findById(productId);
  product.averageRating = parseFloat(averageRating) ?? product.averageRating;
  product.numReviews = allReviews.length ?? product.numReviews;
  await product.save();

  res
    .status(200)
    .json({ success: true, message: 'Review posted successfully' });
});
