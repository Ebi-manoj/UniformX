import expressAsyncHandler from 'express-async-handler';
import { Category } from '../model/category_model.js';
import { Club } from '../model/club_model.js';

export const fetchCategories = expressAsyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  const clubs = await Club.find();
  res.locals.categories = categories;
  res.locals.clubs = clubs;
  next();
});
