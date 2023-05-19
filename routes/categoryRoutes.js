const express = require('express');
const authController = require('../controller/authController');
const categoryController = require('../controller/categoryController');
const subcategoryRoute = require('./subcategoryRoute');

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

router
  .route('/:id')
  .get(authController.protect, categoryController.getOneCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    categoryController.uploadCategoryImage,
    categoryController.resizeImage,
    categoryController.updateCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    categoryController.deleteCategory
  );

module.exports = router;
