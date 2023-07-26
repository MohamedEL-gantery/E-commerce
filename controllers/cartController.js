const asyncHandler = require('express-async-handler');
const Product = require('../model/productModel');
const Coupon = require('../model/couponModel');
const Cart = require('../model/cartModel');
const ApiError = require('../utils/appError');

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
  });

  cart.totalCartPrice = totalPrice;
  cart.totalPriceAfterDiscount = undefined;

  return totalPrice;
};

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const { productId, color } = req.body;
  const product = await Product.findById(productId);
  // 1) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // create cart fot logged user with product
    cart = await Cart.create({
      user: req.user.id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );
    if (productIndex > -1) {
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // product not exist in cart,  push product to cartItems array
      cart.cartItems.push({ product: productId, color, price: product.price });
    }
  }
  // Calculate total cart price
  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.getUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.deleteSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user.id },
    {
      $pull: { cartItems: { _id: req.params.itemId } },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.deleteCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.updateCartItemQuantity = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    return next(new AppError('No cart found for this user', 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new ApiError('No item found for this id ', 404));
  }

  calcTotalCartPrice(cart);
  await cart.save();

  res.status(200).json({
    status: 'success',
    message: 'Product added to cart successfully',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get coupon based on coupon name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: { $gt: Date.now() },
  });

  if (!coupon) {
    return next(new ApiError('Coupon is invalid or expired'), 401);
  }
  // 2) Get logged user cart to get total cart price
  const cart = await Cart.findOne({ user: req.user.id });

  const totalPrice = cart.totalCartPrice;
  // 3) Calculate price after priceAfterDiscount
  const totalPriceAfterDiscount = (
    totalPrice -
    (totalPrice * coupon.discount) / 100
  ).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: 'success',
    numOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
