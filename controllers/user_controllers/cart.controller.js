import asyncHandler from 'express-async-handler';
import { Product } from '../../model/product_model.js';
import { Cart } from '../../model/cart_model.js';
import { Wishlist } from '../../model/wishlist.js';
import { validateId } from '../../utilities/validateId.js';

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, size } = req.body;
  const quantity = parseInt(req.body.quantity);

  // Validate product availability
  const product = await Product.findById(productId)
    .populate('club_id')
    .populate('category_id');
  // Check if product can be added to cart
  if (
    !product ||
    product.is_deleted ||
    !product.category_id.isActive ||
    !product.club_id.isActive
  ) {
    return res
      .status(404)
      .json({ success: false, message: 'Product out of stock' });
  }

  const selectedSize = product.sizes.find(
    s => s.size.toLowerCase() === size.toLowerCase()
  );
  console.log(selectedSize);

  // Check if product is in stock
  if (selectedSize.stock_quantity <= 0) {
    return res
      .status(404)
      .json({ success: false, message: 'Product out of stock' });
  }

  const userId = req.user?._id;
  if (!validateId(userId)) {
    return res.status(404).json({ success: false, message: 'Session expired' });
  }

  //  Get user's cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, products: [], totalPrice: 0 });
  }

  //  Check if product already exists in cart
  const existingItemIndex = cart.products.findIndex(
    item =>
      item.productId._id.toString() === productId.toString() &&
      item.size.toLowerCase() === selectedSize.size.toLowerCase()
  );

  if (existingItemIndex > -1) {
    // Update quantity of existing item
    const newQuantity = cart.products[existingItemIndex].quantity + quantity;

    // Validate against stock and max quantity per order
    if (newQuantity > selectedSize.stock_quantity) {
      console.log('hai');
      return res
        .status(404)
        .json({ success: false, message: 'Not enough stock available' });
    }
    cart.products[existingItemIndex].quantity = newQuantity;
  } else {
    // Add as new item
    if (quantity > selectedSize.stock_quantity) {
      return res
        .status(404)
        .json({ success: false, message: 'Not enough stock available' });
    }
    cart.products.push({
      productId,
      quantity,
      size,
    });
  }

  // Remove from wishlist if present
  await Wishlist.updateOne({ userId }, { $pull: { products: productId } });
  cart = await cart.populate('products.productId');

  // Recalculate cart total
  cart.totalPrice = cart.products.reduce(
    (total, item) => total + item.productId.price * item.quantity,
    0
  );
  console.log(cart);
  console.log(cart.totalPrice);

  // Save cart
  await cart.save();
  res.status(200).json({ success: true, message: 'Product added to Cart' });
});
