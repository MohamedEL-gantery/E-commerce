const express = require('express');
const authController = require('../controller/authController');
const brandConroller = require('../controller/brandController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    brandConroller.uploadBrandImage,
    brandConroller.resizeImage,
    brandConroller.createBrand
  )
  .get(brandConroller.getAllBrand);

router
  .route('/:id')
  .get(authController.protect, brandConroller.getOneBrand)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    brandConroller.uploadBrandImage,
    brandConroller.resizeImage,
    brandConroller.updateBrand
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    brandConroller.deleteBrand
  );

module.exports = router;
