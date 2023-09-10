const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.post('/signup', authController.signUp);

router.post('/login', authController.login);

router.get('/logout', authController.logout);

router.post('/forgetpassword', authController.forgetPassword);

router.post('/verifyresetcode', authController.verifyPasswordResetCode);

router.patch('/resetpassword', authController.resetPassword);

// Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updatepassword', authController.updatePassword);

router.patch(
  '/createprofile',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.createProfile
);

router.get('/me', userController.getme, userController.getOne);

router.patch(
  '/updateme',
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.getme,
  userController.updateUser
);

router.delete('/deleteme', userController.deleteme);

router.use(authController.restrictTo('admin', 'manager'));

router.get('/', userController.getAllUser);

router
  .route('/:id')
  .get(userController.getOne)
  .patch(
    userController.uploadUserPhoto,
    userController.resizeUserPhoto,
    userController.updateUser
  )
  .delete(userController.deleteOne);

module.exports = router;
