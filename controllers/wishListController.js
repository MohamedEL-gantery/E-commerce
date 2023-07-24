const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');

exports.addProductToWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $addToSet: { wishlist: req.body.productId },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'product added successfully',
    data: user.wishlist,
  });
});

exports.deleteProductFromWishList = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    {
      $pull: { wishlist: req.params.productId },
    },
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    message: 'product remove successfully',
    data: user.wishlist,
  });
});

exports.getAllWishlistToUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate('wishlist');

  res.status(200).json({
    status: 'success',
    results: user.wishlist.length,
    data: user.wishlist,
  });
});
