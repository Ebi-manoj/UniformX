import mongoose from 'mongoose';
import { Cart } from '../model/cart_model.js';
import { User } from '../model/user_model.js';
import { Order } from '../model/order_model.js';
import { Product } from '../model/product_model.js';

const TAX_RATE = 0.05;
export const calculateCartTotal = async function (cart) {
  // Recalculate cart total
  cart.totalPrice = cart.products.reduce(
    (total, item) => total + item.productId.price * item.quantity,
    0
  );
  cart.discountPrice = cart.products.reduce(
    (total, item) =>
      total +
      (item.productId.price *
        item.quantity *
        (item.productId.discountPercentage || 0)) /
        100,
    0
  );
  cart.totalOfferDiscount = cart.products.reduce(
    (total, item) => total + (item.offerApplied || 0) * item.quantity,
    0
  );
};
// prettier-ignore
export const confirmOrder = async function ( userId, shippingAddress, paymentMethod,paymentStatus='PENDING' ) {
    const session = await mongoose.startSession();
    session.startTransaction();
  
    try {
      const [cart] = await Cart.find({ userId })
        .populate({
          path: 'products.productId',
          select: 'title price image_url sizes status category_id discount',
        })
        .session(session);
  
      if (!cart || !cart.products.length) {
        throw new Error('Cart is empty or not found');
      }
  
      const user = await User.findById(userId).session(session);
      if (cart.coupon && user) {
        user.couponApplied.push(cart.coupon);
        await user.save({ session });
      }
  
      const subtotal = cart.totalPrice;
      const discount = cart.discountPrice || 0;
      const couponDiscount = cart.couponDiscount ?? 0;
      const taxAmount = (subtotal - discount) * TAX_RATE;
      const offerApplied=cart.totalOfferDiscount||0
      const totalAmount = subtotal + taxAmount - discount - couponDiscount - offerApplied;
  
        const orderItems = cart.products.map(item => { 
        const originalPrice = item.productId.price;
        const discount = item.productId.discount || 0;
        const discountedPrice = originalPrice - (originalPrice * discount) / 100;
  
        return {
          product: item.productId._id,
          title: item.productId.title,
          price: discountedPrice,
          size: item.size,
          quantity: item.quantity,
          offerApplied:item.offerApplied??0,
          image: item.productId.image_url?.[0] || null,
          status: 'PROCESSING',
          paymentStatus:paymentStatus,
          statusHistory: [
            { status: 'PROCESSING', timestamp: new Date(), note: 'Order received' },
          ],
        };
      });
  
      const order = new Order({
        user: userId,
        items: orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentStatus,
        subtotal,
        taxAmount,
        discount,
        totalAmount,
        couponDiscount,
        totalOfferApplied:offerApplied
      });
  
      await order.save({ session });
  
      const updateResults = await Promise.all(
        cart.products.map(item =>
          Product.updateOne(
            { _id: item.productId._id, 'sizes.size': item.size },
            { $inc: { 'sizes.$.stock_quantity': -item.quantity } },
            { session }
          )
        )
      );
  
      if (updateResults.some(res => res.modifiedCount === 0)) {
        throw new Error('Stock update failed for some products');
      }
  
      await Cart.deleteOne({ _id: cart._id }, { session });
  
      await session.commitTransaction();
      return { success: true, orderNumber: order.orderNumber };
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  };
