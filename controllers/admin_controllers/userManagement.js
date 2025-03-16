import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';

export const getUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 10;
  const skip = (page - 1) * limit;

  const searchQuery = req.query.search?.trim() || '';
  let query = {};
  console.log(searchQuery);

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
    cssFile: 'user_manage',
    users,
    limit,
    page,
    totalPages,
    totalUsers,
    searchQuery,
  });
});
