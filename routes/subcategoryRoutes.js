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

// Protect all routes after this middleware
router.use(authController.protect);

router
  .route('/:id')
  .get(subCategoryConroller.getOneSubCategory)
  .patch(
    authController.restrictTo('admin', 'manager'),
    subCategoryConroller.updateSubCategory
  )
  .delete(
    authController.restrictTo('admin'),
    subCategoryConroller.deleteSubCategory
  );

module.exports = router;
