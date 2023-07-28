const asyncHandler = require('express-async-handler');
const Product = require('../model/productModel');
const Coupon = require('../model/couponModel');
const Cart = require('../model/cartModel');
const ApiError = require('../utils/apiError');

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

  // 1) Check if the product quantity is greater than 0
  if (product.quantity <= 0) {
    return next(new ApiError('The product is out of stock', 400));
  }

  /*// 2) Check if the chosen color exists in the product
  if (!product.colors.some((c) => c.color === color)) {
    return next(
      new ApiError('The chosen color is not available for this product', 400)
    );
  }
  
   // Check if the number of product quantity is less than or equal to the number of product quantity in stock
      if (product.quantity < 0) {
        return next(new ApiError('The product is out of stock', 400));
      }
  */

  //  3) Get Cart for logged user
  let cart = await Cart.findOne({ user: req.user.id });

  if (!cart) {
    // 4) create cart for logged user with product
    cart = await Cart.create({
      user: req.user.id,
      cartItems: [{ product: productId, color, price: product.price }],
    });
  } else {
    // 5) product exist in cart, update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color
    );

    if (productIndex > -1) {
      //  Check if the number of product quantity is less than or equal to the number of product quantity in stock
      const cartItem = cart.cartItems[productIndex];
      if (product.quantity < cartItem.quantity + 1) {
        return next(
          new ApiError(`The quantity of ${product.name} is not available`, 400)
        );
      }
      cartItem.quantity += 1;
      cart.cartItems[productIndex] = cartItem;
    } else {
      // 6) product not exist in cart, push product to cartItems array
      cart.cartItems.push({
        product: productId,
        color,
        price: product.price,
      });
    }
  }

  // 6) Calculate total cart price
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
    return next(new ApiError('No cart found for this user', 404));
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
    return next(new ApiError('No cart found for this user', 404));
  }

  const itemIndex = cart.cartItems.findIndex(
    (item) => item._id.toString() === req.params.itemId
  );

  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    const product = await Product.findById(cartItem.product);
    // Check if the requested quantity is valid and available
    if (product.quantity < quantity || quantity < 0) {
      return next(
        new ApiError(`The quantity of ${product.name} is not available`, 400)
      );
    }
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(new ApiError('No cart found for this id', 404));
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
