const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const Category = require('../model/categoryModel');
const ApiFeatures = require('../utils/apiFeatures');
const ApiError = require('../utils/apiError');
const uploadImageController = require('./uploadImageController');

exports.uploadCategoryImage = uploadImageController.uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `category-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/categories/${filename}`);
  // Save image into our db
  req.body.image = filename;
  next();
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const newCategory = await Category.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newCategory,
  });
});

exports.getAllCategory = asyncHandler(async (req, res, next) => {
  const documentCount = await Category.countDocuments();

  const features = new ApiFeatures(Category.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .search()
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const category = await query;

  res.status(200).json({
    status: 'success',
    results: category.length,
    paginationResult,
    data: category,
  });
});

exports.getOneCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return next(new ApiError('No Category for this id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!category) {
    return next(new ApiError('No Category for this id', 404));
  }

  await category.save();

  res.status(200).json({
    status: 'success',
    data: category,
  });
});

exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return next(new ApiError('No Category for this id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
