import asyncHandler from 'express-async-handler';
import { Category } from '../../model/category_model.js';

export const getCategory = asyncHandler(async (req, res) => {
  res.render('admin/categoryManage', {
    category: 'main',
    cssFile: 'user_manage',
    js_file: 'category',
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
