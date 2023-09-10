const asyncHandler = require('express-async-handler');
const Review = require('../model/reviewModel');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createReview = asyncHandler(async (req, res, next) => {
  //Allow nested routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  const newReview = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newReview,
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
    data: review,
  });
});

exports.getReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.updateReview = asyncHandler(async (req, res, next) => {
  let review;
  review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review for this id', 404));
  }
  if (req.user.id != review.user.id) {
    return next(
      new ApiError(
        'You do not have permission to perform this action only for owner of review',
        401
      )
    );
  }

  await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  // Trigger "save" event when update document
  review.save();

  res.status(200).json({
    status: 'success',
    data: review,
  });
});

exports.deleteReview = asyncHandler(async (req, res, next) => {
  let review;
  review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ApiError('No review for this id', 404));
  }
  if (req.user.role !== 'admin' && req.user.id !== review.user.id) {
    return next(
      new ApiError(
        'You do not have permission to perform this action. Only the owner of the review.',
        401
      )
    );
  }

  review = await Review.findByIdAndDelete(req.params.id);

  // Trigger "remove" event when update document
  review.remove();

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
