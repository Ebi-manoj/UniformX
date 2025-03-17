import asyncHandler from 'express-async-handler';

export const getClubCategory = asyncHandler(async (req, res) => {
  res.render('admin/clubCategory', {
    category: 'club',
    cssFile: 'user_manage',
    js_file: 'userManage',
  });
});
