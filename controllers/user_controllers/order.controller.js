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
        select: 'title price image_url sizes status category_id',
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
      console.log('...............................');

      console.log(item.productId);
      console.log('...............................');

      return {
        product: item.productId._id,
        title: item.productId.title,
        price: item.productId.price,
        quantity: item.quantity,
        image:
          item.productId.image_url && item.productId.image_url.length > 0
            ? item.productId.image_url[0]
            : null,
      };
    });
    console.log(orderItems);

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

    const updateResults = await Promise.all(
      cart.products.map(async item => {
        return Product.updateOne(
          { _id: item.productId._id, 'sizes.size': item.size },
          { $inc: { 'sizes.$.stock_quantity': -item.quantity } },
          { session }
        );
      })
    );

    const failedUpdates = updateResults.filter(res => res.modifiedCount === 0);

    if (failedUpdates.length > 0) {
      throw new Error('Stock update failed for some products');
    }

    // Clear the cart
    console.log(cart._id);

    await Cart.deleteOne({ _id: cart._id }, { session });
    await order.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    res.status(200).json({
      success: true,
      message: 'Order Placed Succesfully',
      redirectUrl: '/order-success',
      orderId: order.orderNumber,
    });
  } catch (error) {
    // Abort the transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    // End the session
    session.endSession();
  }
});

/////////////////////////////////////////////
////Get order Success Page

export const getOrderSucces = asyncHandler(async (req, res) => {
  const orderNumber = req.params.id;
  console.log(orderNumber);

  const order = await Order.findOne({ orderNumber }).populate('user', 'email');
  if (!order) {
    req.flash('error', 'Something went wrong');
    return res.redirect('/cart');
  }
  console.log(order);
  const details = {
    orderNumber: order.orderNumber,
    orderDate: order.createdAt.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    customerEmail: order.user.email,
    totalAmount: order.totalAmount,
  };
  res.render('user/success_order', { layout: userMain, details });
});

///////////////////////////////////////////
//Get All Orders

export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().populate('user', 'name email');
  res.render('user/orders', { layout: userMain, orders });
});
