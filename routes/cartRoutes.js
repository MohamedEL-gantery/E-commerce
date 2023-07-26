const express = require('express');
const authController = require('../controllers/authController');
const cartontroller = require('../controllers/cartController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect, authController.restrictTo('user'));

router
  .route('/')
  .post(cartontroller.addProductToCart)
  .get(cartontroller.getUserCart)
  .delete(cartontroller.deleteCart);

router.patch('/applyCoupon', cartontroller.applyCoupon);

router
  .route('/:itemId')
  .patch(cartontroller.updateCartItemQuantity)
  .delete(cartontroller.deleteSpecificCartItem);

module.exports = router;
