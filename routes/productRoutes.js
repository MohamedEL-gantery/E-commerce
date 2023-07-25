const express = require('express');
const authController = require('../controllers/authController');
const productController = require('../controllers/productController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// POST /product/234fad4/reviews
// GET /product/234fad4/reviews
router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    productController.uploadProductPhoto,
    productController.resizeProductPhoto,
    productController.createProduct
  )
  .get(productController.getAllProducts);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/:id')
  .get(productController.getOneProduct)
  .patch(
    authController.restrictTo('admin', 'manager'),
    productController.uploadProductPhoto,
    productController.resizeProductPhoto,
    productController.updateProduct
  )
  .delete(authController.restrictTo('admin'), productController.deleteProduct);

module.exports = router;
