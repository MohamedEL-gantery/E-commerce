const express = require('express');
const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const subcategoryRoute = require('./subcategoryRoutes');

const router = express.Router();

router.use('/:categoryId/subcategories', subcategoryRoute);

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryController.createCategory
  )
  .get(categoryController.getAllCategory);

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/:id')
  .get(categoryController.getOneCategory)
  .patch(
    authController.restrictTo('admin', 'manager'),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryController.updateCategory
  )
  .delete(
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
