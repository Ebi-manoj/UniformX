import mongoose from 'mongoose';
import { Cart } from '../model/cart_model.js';
import { User } from '../model/user_model.js';
import { Order } from '../model/order_model.js';
import { Product } from '../model/product_model.js';
import { Transaction } from '../model/transaction.js';
import { Wallet } from '../model/wallet.js';

const TAX_RATE = 0.05;
const CODTHRESHOLD = 10000;
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
          select: 'title price image_url sizes status category_id discountPercentage',
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
      const coupon=cart.coupon||null
      const couponDiscount = cart.couponDiscount ?? 0;
      const taxAmount = (subtotal - discount) * TAX_RATE;
      const taxPerItem=taxAmount/cart.products.length
      const offerApplied=cart.totalOfferDiscount||0
      const totalAmount = subtotal + taxAmount - discount - couponDiscount - offerApplied;

      // Validate Cod only under 5000
      if(totalAmount>CODTHRESHOLD&&paymentMethod==='COD'){
        throw new Error(`Cash on Delivery is not available above ${CODTHRESHOLD} `)
      }

      // check wallet payment and create transaction

      if(paymentMethod==='WALLET'){
        const wallet=await Wallet.findOne({user:userId}).session(session)
        if(!wallet||wallet.balance<totalAmount){
          throw new Error('You dont have enough balance')
        }
        const transaction= new Transaction({
          user:userId,
          amount:totalAmount,
          type:'DEBIT',
          status:'SUCCESS',
          shippingAddress,
          paymentMethod:'WALLET'
      })
       await transaction.save({ session })
        wallet.transactionHistory.push(transaction)
        wallet.balance-=totalAmount
        await wallet.save({ session })
        paymentStatus='COMPLETED'
      }
        
        const orderItems = cart.products.map(item => { 
        const originalPrice = item.productId.price;
        const discount = item.productId.discountPercentage || 0;
        const discountedPrice = originalPrice - (originalPrice * discount) / 100;
        const offerApplied=item.offerApplied??0
        
        return {
          product: item.productId._id,
          title: item.productId.title,
          price: originalPrice,
          totalPrice:discountedPrice-offerApplied,
          tax:taxPerItem,
          size: item.size,
          quantity: item.quantity,
          offerApplied:offerApplied,
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
        coupon,
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
