import asyncHandler from 'express-async-handler';
import { Club } from '../../model/club_model.js';

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
    .limit(limit);

  res.render('admin/clubCategory', {
    category: 'club',
    cssFile: 'user_manage',
    js_file: 'category',
    totalCount,
    totalPages,
    searchQuery,
    limit,
  });
});
