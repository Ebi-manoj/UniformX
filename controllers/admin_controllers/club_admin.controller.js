import asyncHandler from 'express-async-handler';
import { Club } from '../../model/club_model.js';
import { validateId } from '../../utilities/validateId.js';
import { Category } from '../../model/category_model.js';
import { v2 as cloudinary } from 'cloudinary';

//////////////////////////////////////////////////
///Get all clubs
export const getClubCategory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 4;
  const skip = (page - 1) * limit;
  const searchQuery = req.query.search?.trim() || '';

  let query = {};
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
    css_file: 'user_manage',
    js_file: 'category',
    currentPage: page,
    totalCount,
    totalPages,
    searchQuery,
    limit,
    clubs,
    categories,
  });
});

/////////////////////////////////////////////////////
/////////addClub
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

////////////////////////////////////////////////////////////
///////edit club
export const editClub = asyncHandler(async (req, res) => {
  const { name, description, category_id } = req.body;
  const { id } = req.params;

  if (!validateId(id)) {
    req.flash('error', 'Invalid Club!');
    return res.redirect('/admin/club-category');
  }

  const club = await Club.findById(id);
  if (!club) {
    req.flash('error', 'No club found!');
    return res.redirect('/admin/club-category');
  }

  if (name && name !== club.name) {
    const titleRegex = new RegExp(`^${name.trim()}$`, 'i');
    const existingCategory = await Club.findOne({
      name: titleRegex,
      _id: { $ne: club._id },
    });
    if (existingCategory) {
      req.flash('error', 'Category already exist with this name');
      return res.redirect('/admin/club-category');
    }
  }

  // Validate required fields
  if (!name || !description) {
    req.flash('error', 'Name and description are required');
    return res.redirect('/admin/club-category');
  }

  // Handle image update
  let imageUrl = club.image;
  if (req.file) {
    imageUrl = req.file.path;
    if (club.image) {
      const publicId = club.image.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`uniformx/clubs/${publicId}`);
    }
  }

  // Update club fields
  club.name = name;
  club.description = description;
  club.category_id = category_id;
  club.image = imageUrl;

  await club.save();

  req.flash('success', 'Club updated successfully!');
  res.redirect('/admin/club-category');
});
///////////////////////////////////////////////////////
//toggle club status
export const toggleClubStatus = async (req, res) => {
  const clubId = req.params.id;
  const club = await Club.findById(clubId);
  if (!club) return res.status(404).json({ message: 'Category not found' });

  club.isActive = !club.isActive;
  await club.save();

  res.status(200).json({ success: true });
};
//////////////////////////////////////////////////////
//delete club permanently

export const deleteClub = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!validateId(id)) {
    req.flash('error', 'Club not Found');
    return res.redirect('/admin/club-category');
  }
  const club = await Club.findById(id);

  // delete cloudinary image
  if (club.image) {
    const publicId = club.image.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`uniformx/categories/${publicId}`);
  }
  const deletedClub = await Club.findByIdAndDelete(id);

  if (!deletedClub) {
    req.flash('error', 'Something went wrong!');
    return res.redirect('/admin/club-category');
  }
  req.flash('success', 'Category deleted Successfully');
  res.redirect('/admin/club-category');
});
