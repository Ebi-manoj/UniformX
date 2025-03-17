import asyncHandler from 'express-async-handler';
import { Category } from '../../model/category_model.js';

export const getCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search?.trim() || '';

  let query = { isActive: true };
  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: 'i' };
  }
  const totalCategories = await Category.countDocuments(query);
  const totalPages = Math.ceil(totalCategories / limit);

  // Fetch categories
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.render('admin/categoryManage', {
    category: 'main',
    cssFile: 'user_manage',
    js_file: 'category',
    categories,
    currentPage: page,
    totalPages,
    totalCategories,
    searchQuery,
  });
});
export const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !req.file) {
    console.log('error');

    return res
      .status(400)
      .json({ error: 'Category name and image are required' });
  }

  // Cloudinary file URL
  const imageUrl = req.file.path;

  const newCategory = new Category({ name, description, image: imageUrl });
  await newCategory.save();

  res.redirect('category');
});
