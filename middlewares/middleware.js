import expressAsyncHandler from 'express-async-handler';
import { Category } from '../model/category_model.js';
import { Club } from '../model/club_model.js';
import { Cart } from '../model/cart_model.js';

/////////////////////////
//fecth categories
export const fetchCategories = expressAsyncHandler(async (req, res, next) => {
  const categories = await Category.find();
  const clubs = await Club.find();
  res.locals.categories = categories;
  res.locals.clubs = clubs;
  next();
});
/////////////////////////
//fetch cart length
export const fetchCartLength = async (req, res, next) => {
  if (!req.user) {
    res.locals.cartLength = 0;
    return next();
  }

  try {
    console.log(req.user._id);

    const cart = await Cart.findOne({ userId: req.user._id });
    res.locals.cartLength = cart ? cart.products.length : 0;
  } catch (err) {
    console.error('Error fetching cart length:fetch.......cartlength', err);
    res.locals.cartLength = 0;
  }

  next();
};
