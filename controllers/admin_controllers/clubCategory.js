import asyncHandler from 'express-async-handler';
import { Club } from '../../model/club_model.js';
import { validateId } from '../../utilities/validateId.js';
import { Category } from '../../model/category_model.js';

export const getClubCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search?.trim() || '';

  let query = { isActive: true };
  if (searchQuery) {
    query.name = { $regex: searchQuery, $options: 'i' };
  }

  const totalCount = await Club.countDocuments(query);
  const totalPages = Math.ceil(totalCount / limit);
  const clubs = await Club.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('category_id', 'name');
  const categories = await Category.find({}, { name: 1 });
  res.render('admin/clubCategory', {
    category: 'club',
    cssFile: 'user_manage',
    js_file: 'category',
    totalCount,
    totalPages,
    searchQuery,
    limit,
    clubs,
    categories,
  });
});

export const addClub = asyncHandler(async (req, res) => {
  const { name, description, category_id } = req.body;
  console.log(req.file);
  console.log(name, description, category_id);
  if (!name || !category_id || !req.file) {
    req.flash('error', 'Fill all the fields');
    res.redirect('/admin/club-category');
  }
  const existingCategory = await Club.findOne({
    name: { $regex: new RegExp(`^${name}$`, 'i') },
  });
  if (existingCategory) {
    req.flash('error', 'Category already exist!');
    res.redirect('/admin/club-category');
  }
  const imageurl = req.file.path;
  if (!validateId(category_id)) {
    req.flash('error', 'Not a valid Main Category');
    res.redirect('/admin/club-category');
  }
  const newClub = new Club({
    name,
    description,
    image: imageurl,
    category_id,
  });
  await newClub.save();
  req.flash('success', 'Club category added');
  res.redirect('/admin/club-category');
});
