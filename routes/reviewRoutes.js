const express = require('express');
const authController = require('../controller/authController');
const reviewController = require('../controller/reviewController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(authController.restrictTo('user'), reviewController.createReview)
  .get(reviewController.getAllReviews);

router.use(authController.restrictTo('user', 'admin', 'manager'));
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.owner, reviewController.updateReview)
  .delete(reviewController.owner, reviewController.deleteReview);

module.exports = router;
