import asyncHandler from 'express-async-handler';
import { Category } from '../../model/category_model.js';

export const getCategory = asyncHandler(async (req, res) => {
  res.render('admin/categoryManage', {
    category: 'main',
    cssFile: 'user_manage',
    js_file: 'userManage',
  });
});
