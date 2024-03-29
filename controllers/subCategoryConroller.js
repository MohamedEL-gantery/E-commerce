const asyncHandler = require('express-async-handler');
const SubCategory = require('../model/subCategoryModel');
const ApiError = require('../utils/apiError');
const ApiFeatures = require('../utils/apiFeatures');

exports.createSubCategory = asyncHandler(async (req, res, next) => {
  //Allow nested routes
  if (!req.body.category) req.body.category = req.params.categoryId;

  const newSubCategory = await SubCategory.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newSubCategory,
  });
});

exports.getAllSubCategory = asyncHandler(async (req, res, next) => {
  // To allow for nested GET reviews on product (hack)
  let filter = {};
  if (req.params.categoryId) filter = { category: req.params.categoryId };
  const documentCount = await SubCategory.countDocuments();

  const features = new ApiFeatures(SubCategory.find(filter), req.query)
    .filter()
    .limitFields()
    .sort()
    .search()
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const subCategory = await query;

  res.status(200).json({
    status: 'success',
    results: subCategory.length,
    paginationResult,
    data: subCategory,
  });
});

exports.getOneSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findById(req.params.id);

  if (!subCategory) {
    return next(new ApiError('No SubCategory for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: subCategory,
  });
});

exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!subCategory) {
    return next(new ApiError('No SubCategory for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: subCategory,
  });
});

exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const subCategory = await SubCategory.findByIdAndDelete(req.params.id);

  if (!subCategory) {
    return next(new ApiError('No SubCategory for this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
