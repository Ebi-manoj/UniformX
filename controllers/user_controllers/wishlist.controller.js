import asyncHandler from 'express-async-handler';
import { Wishlist } from '../../model/wishlist.js';
import { validateId } from '../../utilities/validateId.js';

const userMain = './layouts/user_main';

export const fetchWishlist = asyncHandler(async (req, res) => {
  console.log('fetch Wishlist');

  const userId = req.user?._id;
  if (!validateId(userId)) {
    return res.status(401).json({ messge: 'session expired' });
  }

  const wishlist = await Wishlist.findOne({ userId }).populate(
    'items.productId'
  );
  res.render('user/wishlist', {
    layout: userMain,
    js_file: 'wishlist',
    wishlist,
  });
});

export const addToWhishlist = asyncHandler(async (req, res) => {
  console.log('Add to wishlist');

  const productId = req.body.productId;
  const userId = req.user._id;
  console.log(productId);

  if (!validateId(productId)) {
    return res
      .status(404)
      .json({ success: false, message: 'Something went Wrong' });
  }

  if (!validateId(userId)) {
    return res.status(404).json({ success: false, message: 'Session expired' });
  }

  let wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    wishlist = new Wishlist({ userId, items: [] });
  }

  // Check if product already exists
  const exists = wishlist.items.some(
    item => item.productId.toString() === productId.toString()
  );

  if (exists) {
    wishlist.items = wishlist.items.filter(
      item => item.productId.toString() !== productId.toString()
    );
    await wishlist.save();
    return res
      .status(200)
      .json({ success: true, message: 'Removed from Wishlist' });
  } else {
    wishlist.items.push({ productId });
    await wishlist.save();
    return res
      .status(200)
      .json({ success: true, message: 'Added to Wishlist' });
  }
});
