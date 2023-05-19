const { Promise } = require('mongoose');
const sharp = require('sharp');
const asyncHandler = require('express-async-handler');
const { v4: uuidv4 } = require('uuid');
const Product = require('../model/productModel');
const ApiFeatures = require('../utils/apifeatures');
const ApiError = require('../utils/appError');
const uploadImageController = require('./uploadImageController');

exports.uploadProductPhoto = uploadImageController.uploadMixImages([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 10 },
]);

exports.resizeProductPhoto = asyncHandler(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  // 1) Cover image
  const imageCoverFileName = `product-${uuidv4()}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/products/${imageCoverFileName}`);

  // Save image into our db
  req.body.imageCover = imageCoverFileName;

  // 2) images
  req.body.images = [];

  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `product-${uuidv4()}-${Date.now()}-${i + 1}.jpeg`;

      await sharp(file.buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/products/${filename}`);

      req.body.images.push(filename);
    })
  );

  next();
});

exports.createProduct = asyncHandler(async (req, res, next) => {
  const newProduct = await Product.create(req.body);

  res.status(201).json({
    status: 'success',
    data: { newProduct },
  });
});

exports.getAllProducts = asyncHandler(
  async (req, res, modelName = 'Products', next) => {
    const documentCount = await Product.countDocuments();

    const features = new ApiFeatures(Product.find(), req.query)
      .filter()
      .limitFields()
      .sort()
      .search(modelName)
      .paginate(documentCount);

    const { query, paginationResult } = features;
    const product = await query;

    res.status(200).json({
      status: 'success',
      results: product.length,
      paginationResult,
      data: { product },
    });
  }
);

exports.getOneProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id).populate('reviews');

  if (!product) {
    return next(new ApiError('No product with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    return next(new ApiError('No product with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { product },
  });
});

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) {
    return next(new ApiError('No product with id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
