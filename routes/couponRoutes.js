const express = require('express');
const authController = require('../controllers/authController');
const couponControlle = require('../controllers/couponController');

const router = express.Router();

// Protect all routes after this middleware
router.use(
  authController.protect,
  authController.restrictTo('admin', 'manager')
);

router
  .route('/')
  .post(couponControlle.createCoupon)
  .get(couponControlle.getAllCoupon);

router
  .route('/:id')
  .get(couponControlle.getOneCoupon)
  .patch(couponControlle.updateCoupon)
  .delete(couponControlle.deleteCoupon);

module.exports = router;
