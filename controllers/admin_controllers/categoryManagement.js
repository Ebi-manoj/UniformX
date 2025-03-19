import asyncHandler from 'express-async-handler';
import { Category } from '../../model/category_model.js';
import { cloudinary } from '../../config/cloudinary.js';
import { validateId } from '../../utilities/validateId.js';

///////////////////////////////////////////////////////////////////////////
//Get all Category
export const getCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search?.trim() || '';

  let query = { isActive: true };
  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: 'i' };
  }
  const totalCount = await Category.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);

  // Fetch categories
  const categories = await Category.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.render('admin/categoryManage', {
    category: 'main',
    cssFile: null,
    js_file: 'category',
    categories,
    currentPage: page,
    totalPages,
    totalCount,
    searchQuery,
    limit,
  });
});
//////////////////////////////////////////////////////////////////////////////////
// AddCategory
export const addCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name || !req.file) {
    console.log('error');
    req.flash('error', 'Name and Image required');
    res.redirect('/admin/category');
  }
  const existingCategory = await Category.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });
  if (existingCategory) {
    req.flash('error', 'A category with this name already exists');
    return res.redirect('/admin/category');
  }

  // Cloudinary file URL
  const imageUrl = req.file.path;

  const newCategory = new Category({ name, description, image: imageUrl });
  await newCategory.save();
  req.flash('success', 'Category added successfully!');
  res.redirect('/admin/category');
});

///////////////////////////////////////////////////////////////////////////////////
//Edit Category
export const editCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  let category = await Category.findById(id);

  if (!category) {
    req.flash('error', 'Category not found');
    return res.redirect('/admin/category');
  }

  let imageUrl = category.image;
  if (req.file) {
    imageUrl = req.file.path;
    console.log('file checked');

    if (category.image) {
      console.log('Category checked');

      const publicId = category.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`uniformx/categories/${publicId}`);
    }
  }

  category.name = name || category.name;
  category.description = description || category.description;
  category.image = imageUrl;
  await category.save();

  req.flash('success', 'Category updated successfully!');
  res.redirect('/admin/category');
});

/////////////////////////////////////////////////////////////////////////////////
//////Delete Category

export const deleteCategory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    req.flash('error', 'Category not Found');
    return res.redirect('/admin/category');
  }
  const deletedCategory = await Category.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  );
  if (!deletedCategory) {
    req.flash('error', 'Something went wrong!');
    return res.redirect('/admin/category');
  }
  req.flash('success', 'Category deleted Successfully');
  res.redirect('/admin/category');
});
