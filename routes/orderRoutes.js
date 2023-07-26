const express = require('express');
const authController = require('../controllers/authController');
const orderController = require('../controllers/orderController');

const router = express.Router();

router.use(authController.protect);

router.post(
  '/:cartId',
  authController.restrictTo('user'),
  orderController.createCashOrder
);

router.get(
  '/',
  authController.restrictTo('user', 'admin', 'manager'),
  orderController.getAllOrder
);

router.get('/:id', orderController.getOrder);

router.patch(
  '/:id/pay',
  authController.restrictTo('admin', 'manager'),
  orderController.updateOrderToPaid
);

router.patch(
  '/:id/deliver',
  authController.restrictTo('admin', 'manager'),
  orderController.updateOrderToDelivered
);

module.exports = router;
