const asyncHandler = require('express-async-handler');
const Coupon = require('../model/couponModel');
const ApiFeatures = require('../utils/apifeatures');
const ApiError = require('../utils/appError');

exports.createCoupon = asyncHandler(async (req, res, next) => {
  const newCoupon = await Coupon.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newCoupon },
  });
});

exports.getAllCoupon = asyncHandler(async (req, res, next) => {
  const documentCount = await Coupon.countDocuments();

  const features = new ApiFeatures(Coupon.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .search()
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const coupon = await query;

  res.status(200).json({
    status: 'success',
    results: coupon.length,
    paginationResult,
    data: { coupon },
  });
});

exports.getOneCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ApiError('No coupon for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { coupon },
  });
});

exports.updateCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!coupon) {
    return next(new ApiError('No coupon for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { coupon },
  });
});

exports.deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);

  if (!coupon) {
    return next(new ApiError('No coupon for this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
