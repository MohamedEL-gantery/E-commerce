const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../model/userModel');
const Review = require('../model/reviewModel');
const ApiFeatures = require('../utils/apifeatures');
const ApiError = require('../utils/appError');

exports.owner = asyncHandler(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    return next(
      new ApiError(' You are not logged in! Please log in to get access', 401)
    );
  }

  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);

  if (!currentUser) {
    return next(
      new ApiError('The user belonging to this token does no longer exist', 401)
    );
  }
  // 4) Check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new ApiError('User recently changed password! Please log in again.', 401)
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.createReview = asyncHandler(async (req, res, next) => {
  //Allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newReview },
  });
});

exports.getAllReviews = asyncHandler(async (req, res, next) => {
  // To allow for nested GET reviews on product (hack)
  let filter = {};
  if (req.params.productId) filter = { product: req.params.productId };

  const documentCount = await Review.countDocuments();
  const features = new ApiFeatures(Review.find(filter), req.query)
    .filter()
    .limitFields()
    .search()
    .sort()
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const review = await query;

  res.status(200).json({
    status: 'success',
    results: review.length,
    paginationResult,
    data: { review },
  });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review;
  review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review with id', 404));
  }
  if (req.user.id != review.user.id) {
    return next(
      new ApiError(
        'You do not have permission to perform this action only for owner of review and admin   ',
        401
      )
    );
  }

  await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { review },
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review;
  review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review with id', 404));
  }

  if (
    req.user.role !== 'admin' ||
    ('manager' && req.user.id != review.user.id)
  ) {
    return next(
      new ApiError(
        'You do not have permission to perform this action only for owner of review and admin',
        401
      )
    );
  }

  review = await Review.findByIdAndDelete(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
