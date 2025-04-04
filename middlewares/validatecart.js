import { Cart } from '../model/cart_model.js';
import { validateId } from '../utilities/validateId.js';

export const validateCartForCheckout = async function (req, res, next) {
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('error', 'Session expired');
    return res.redirect('/cart');
  }
  const cart = await Cart.findOne({ userId }).populate({
    path: 'products.productId',
    select: 'name price sizes is_deleted category_id',
    populate: {
      path: 'category_id',
      select: 'isActive',
    },
  });

  if (!cart || cart.products.length === 0) {
    req.flash('error', 'Cart is empty');
    return res.redirect('/cart');
  }

  let invalidItems = true;
  // Validate each item
  for (const item of cart.products) {
    const product = item.productId;

    // Check if product is still available
    if (!product || product.is_deleted || !product.category_id.isActive) {
      invalidItems = false;
      break;
    }
    const selectedSize = product.sizes.find(
      product => product.size.toLowerCase() === item.size.toLowerCase()
    );
    // Check if enough stock
    if (item.quantity > selectedSize.stock_quantity) {
      invalidItems = false;
    }
  }

  if (!invalidItems) {
    req.flash(
      'error',
      'Some items in your cart are unavailable or out of stock'
    );
    return res.redirect('/cart');
  }

  next();
};
