import asyncHandler from 'express-async-handler';
import { Product } from '../../model/product_model.js';

// Add to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size } = req.body;

  // Validate product availability
  const product = await Product.findById(productId);

  // 2. Check if product can be added to cart
  if (!product || product.status !== 'active' || !product.category.isActive) {
    throw new Error('Product unavailable');
  }

  // 3. Check if product is in stock
  if (product.stockQuantity <= 0) {
    throw new Error('Product out of stock');
  }

  // 4. Get user's cart
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = new Cart({ userId, items: [], totalPrice: 0 });
  }

  // 5. Check if product already exists in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.productId.toString() === productId.toString()
  );

  if (existingItemIndex > -1) {
    // Update quantity of existing item
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;

    // Validate against stock and max quantity per order
    if (newQuantity > product.stockQuantity) {
      throw new Error('Not enough stock available');
    }

    if (newQuantity > product.maxQuantityPerOrder) {
      throw new Error(
        `You can only add up to ${product.maxQuantityPerOrder} units of this product`
      );
    }

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add as new item
    if (quantity > product.stockQuantity) {
      throw new Error('Not enough stock available');
    }

    if (quantity > product.maxQuantityPerOrder) {
      throw new Error(
        `You can only add up to ${product.maxQuantityPerOrder} units of this product`
      );
    }

    cart.items.push({
      productId,
      price: product.price,
      quantity,
    });
  }

  // 6. Remove from wishlist if present
  await Wishlist.updateOne({ userId }, { $pull: { products: productId } });

  // 7. Recalculate cart total
  cart.totalPrice = cart.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // 8. Save cart
  await cart.save();

  return cart;
});
