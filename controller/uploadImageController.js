const multer = require('multer');
const ApiError = require('../utils/appError');

const multerStorage = multer.memoryStorage();

const multerOptions = () => {
  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(new ApiError('Not an image please upload only image', 400), false);
    }
  };

  const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter,
  });

  return upload;
};

exports.uploadSingleImage = (fieldName) => multerOptions().single(fieldName);

exports.uploadMixImages = (arrayOfImages) =>
  multerOptions().fields(arrayOfImages);
