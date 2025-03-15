import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';

export const getUser = asyncHandler(async (req, res) => {
  const page = req.query.page || 1;
  const limit = 10;
  const skip = (page - 1) * 10;

  const searchQuery = req.query.search || '';
  let query = {};
  if (searchQuery) {
    query = {
      $or: [
        { full_name: { $regex: searchQuery, $options: 'i' } },
        { email: { $regex: searchQuery, $options: 'i' } },
        { phone: { $regex: searchQuery, $options: 'i' } },
      ],
    };
  }
  const totalUsers = await User.countDocuments(query);
  const totalPages = Math.ceil(totalUsers / limit);

  const users = await User.find(query)
    .sort({ join_date: -1 })
    .skip(skip)
    .limit(limit);

  res.render('admin/userManage', {
    users,
    currentPage: page,
    totalPages,
    totalUsers,
    searchQuery,
  });
});
