const express = require('express');
const authController = require('../controllers/authController');
const subCategoryConroller = require('../controllers/subCategoryConroller');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    subCategoryConroller.createSubCategory
  )
  .get(subCategoryConroller.getAllSubCategory);

router
  .route('/:id')
  .get(authController.protect, subCategoryConroller.getOneSubCategory)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'manager'),
    subCategoryConroller.updateSubCategory
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    subCategoryConroller.deleteSubCategory
  );

module.exports = router;
