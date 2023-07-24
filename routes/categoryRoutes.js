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
