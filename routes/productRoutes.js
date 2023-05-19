const express = require('express');
const authController = require('../controller/authController');
const productController = require('../controller/productController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

// POST /product/234fad4/reviews
// GET /product/234fad4/reviews
router.use('/:productId/reviews', reviewRouter);

router.get('/allproductds', productController.getAllProducts);

router.get('/:id', authController.protect, productController.getOneProduct);

router.post(
  '/',
  authController.protect,
  authController.restrictTo('admin', 'manager'),
  productController.uploadProductPhoto,
  productController.resizeProductPhoto,
  productController.createProduct
);

router
  .route('/:id')
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    productController.uploadProductPhoto,
    productController.resizeProductPhoto,
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = router;
