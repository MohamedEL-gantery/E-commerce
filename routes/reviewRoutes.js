const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.createReview
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.owner,
    reviewController.updateReview
  )
  .delete(
    authController.protect,
    authController.restrictTo('user', 'admin', 'manager'),
    reviewController.owner,
    reviewController.deleteReview
  );

module.exports = router;
