const express = require('express');
const authController = require('../controllers/authController');
const wishlistController = require('../controllers/wishListController');

const router = express.Router();

// Protect all routes after this middleware
router.use(authController.protect, authController.restrictTo('user'));

router
  .route('/')
  .post(wishlistController.addProductToWishList)
  .get(wishlistController.getAllWishlistToUser);

router.delete('/:productId', wishlistController.deleteProductFromWishList);

module.exports = router;
