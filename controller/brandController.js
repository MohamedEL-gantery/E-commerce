const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const Brand = require('../model/brandModel');
const ApiFeatures = require('../utils/apifeatures');
const ApiError = require('../utils/appError');
const uploadImageController = require('./uploadImageController');

exports.uploadBrandImage = uploadImageController.uploadSingleImage('image');

exports.resizeImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `brand-${uuidv4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/brands/${filename}`);
  // Save image into our db
  req.body.image = filename;
  next();
});

exports.createBrand = asyncHandler(async (req, res, next) => {
  const newBrand = await Brand.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newBrand },
  });
});

exports.getAllBrand = asyncHandler(async (req, res, modelName = '', next) => {
  const documentCount = await Brand.countDocuments();

  const features = new ApiFeatures(Brand.find(), req.query)
    .filter()
    .limitFields()
    .sort()
    .search(modelName)
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const brand = await query;

  res.status(200).json({
    status: 'success',
    results: brand.length,
    paginationResult,
    data: { brand },
  });
});

exports.getOneBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);

  if (!brand) {
    return next(new ApiError('No Brand with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { brand },
  });
});

exports.updateBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!brand) {
    return next(new ApiError('No Brand with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { brand },
  });
});

exports.deleteBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);

  if (!brand) {
    return next(new ApiError('No Brand with id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
