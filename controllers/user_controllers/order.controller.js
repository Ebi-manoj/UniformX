import asyncHandler from 'express-async-handler';
import { validateId } from '../../utilities/validateId.js';
import Address from '../../model/address.js';
import { Cart } from '../../model/cart_model.js';
import mongoose from 'mongoose';
import { Order } from '../../model/order_model.js';
import { Product } from '../../model/product_model.js';

const userMain = './layouts/user_main';
const TAX_RATE = 0.05;

export const getCheckout = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  if (!validateId(userId)) {
    req.flash('error', 'session expired!');
    return res.redirect('/cart');
  }
  //address
  const addresses = await Address.find({ userId });

  // cart
  const cart = await Cart.find({ userId }).populate('products.productId');

  const taxAmount = (cart[0].totalPrice - cart[0].discountPrice) * TAX_RATE;
  const finalPrice = cart[0].totalPrice - cart[0].discountPrice + taxAmount;
  console.log(cart);
  console.log(taxAmount);
  console.log(finalPrice);
  res.render('user/checkout', {
    js_file: 'checkout',
    layout: userMain,
    addresses,
    cart: cart[0],
    taxAmount,
    finalPrice,
  });
});

///////////////////////
//Place an Order
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user?._id;
  // console.log(userId);
  // console.log(req.body);
  const { shippingAddress, paymentMethod } = req.body;
  if (!validateId(userId)) {
    req.flash('error', 'session expired');
    return res.redirect('/checkout');
  }
  // Start a transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Get the user's cart and validate it
    const [cart] = await Cart.find({ userId })
      .populate({
        path: 'products.productId',
        select: 'name price image_url sizes status category_id',
      })
      .session(session);

    // Calculate order amounts
    const subtotal = cart.totalPrice;
    const discount = cart.discountPrice;
    const taxAmount = subtotal * TAX_RATE;
    const totalAmount = subtotal + taxAmount - discount;
    console.log(cart);

    // Create order items
    const orderItems = cart.products.map(item => {
      return {
        product: item.productId._id,
        name: item.productId.title,
        price: item.price,
        quantity: item.quantity,
        image:
          item.productId.image_url && item.productId.image_url.length > 0
            ? item.productId.image_url[0]
            : null,
      };
    });

    // Create new order
    const order = new Order({
      user: userId,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'PENDING',
      subtotal,
      taxAmount,
      discount,
      totalAmount,
      status: 'PROCESSING',
      statusHistory: [
        {
          status: 'PROCESSING',
          timestamp: new Date(),
          note: 'Order received',
        },
      ],
    });

    // Save the order
    await order.save({ session });

    // Update product stock quantities
    for (const item of cart.products) {
      const selectedSize = item.productId.size;
      await Product.updateOne(
        { _id: item.productId._id },
        { $inc: { [`sizes.${selectedSize}.stock_quantity`]: -item.quantity } },
        { session }
      );
    }

    // Clear the cart
    console.log(cart._id);

    await Cart.deleteOne({ _id: cart._id }, { session });

    // // Generate invoice (can be implemented later)
    // const invoiceUrl = await generateInvoice(order);
    // order.invoiceUrl = invoiceUrl;
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();

    res
      .status(200)
      .json({ success: true, message: 'Order Placed Succesfully' });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
});
