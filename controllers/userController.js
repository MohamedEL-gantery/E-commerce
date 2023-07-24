const asyncHandler = require('express-async-handler');
const sharp = require('sharp');
const User = require('../model/userModel');
const ApiFeatures = require('../utils/apifeatures');
const ApiError = require('../utils/appError');
const uploadImageController = require('./uploadImageController');

exports.getme = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.uploadUserPhoto = uploadImageController.uploadSingleImage('photo');

exports.resizeUserPhoto = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `user-${req.user.id}--${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
      quality: 90,
    })
    .toFile(`public/users/${filename}`);
  req.body.photo = filename;
  next();
});

exports.createProfile = asyncHandler(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(
        'This route is not for password updates. Please use /updatepassword.',
        400
      )
    );
  }

  const createProfile = await User.findByIdAndUpdate(
    req.user.id,
    {
      photo: req.body.photo,
      phone: req.body.phone,
      age: req.body.age,
      birthDate: req.body.birthDate,
      location: req.body.location,
      gender: req.body.gender,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    status: 'success',
    data: { createProfile },
  });
});

exports.getAllUser = asyncHandler(async (req, res, next) => {
  const documentCount = await User.countDocuments();
  const features = new ApiFeatures(User.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .search()
    .paginate(documentCount);

  const { query, paginationResult } = features;
  const allUser = await query;

  res.status(200).json({
    status: 'success',
    results: allUser.length,
    paginationResult,
    data: { allUser },
  });
});

exports.getOne = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ApiError('No user found with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

// Update User
exports.updateUser = asyncHandler(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new ApiError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }

  const updateUser = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updateUser) {
    return next(new ApiError('No user found with id', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { updateUser },
  });
});

exports.deleteme = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

exports.deleteOne = asyncHandler(async (req, res, next) => {
  const data = await User.findByIdAndDelete(req.params.id);

  if (!data) {
    return next(new ApiError('No user found with id', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});
