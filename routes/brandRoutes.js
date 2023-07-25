const express = require('express');
const authController = require('../controllers/authController');
const brandConroller = require('../controllers/brandController');

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

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/:id')
  .get(brandConroller.getOneBrand)
  .patch(
    authController.restrictTo('admin', 'manager'),
    brandConroller.uploadBrandImage,
    brandConroller.resizeImage,
    brandConroller.updateBrand
  )
  .delete(authController.restrictTo('admin'), brandConroller.deleteBrand);

module.exports = router;
