import asyncHandler from 'express-async-handler';
import { User } from '../../model/user_model.js';

///////////////////////////////////////////////////////////////
///get Users
export const getUser = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 6;
  const skip = (page - 1) * limit;

  const searchQuery = req.query.search?.trim() || '';
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
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  res.render('admin/userManage', {
    cssFile: null,
    js_file: 'userManage',
    users,
    limit,
    page,
    totalPages,
    totalUsers,
    search: searchQuery,
    success_msg: false,
    error_msg: false,
  });
});

///////////////////////////////////////////////////////////////////
///Toggle Block functionality
export const toggleBlock = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;
  const user = await User.findByIdAndUpdate(
    id,
    { is_blocked: isBlocked },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ success: false, message: 'User not found' });
    console.log('error in updating database block');
    return;
  }

  console.log(' updated database block');
  res.json({
    success: true,
    message: `User ${isBlocked ? 'blocked' : 'unblocked'} successfully`,
    user,
  });
});
