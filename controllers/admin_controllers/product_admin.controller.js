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

  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: 'i' };
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
    category: 'main',
    cssFile: null,
    js_file: null,
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
