const express = require('express');

const userRouter = express.Router();

const userController = require('../controllers/userController');

const authController = require('../controllers/authController');

userRouter.route('/signUp').post(authController.signUp);

userRouter.route('/login').post(authController.login);

userRouter.route('/forgotPassword').post(authController.forgotPassword);

userRouter.route('/resetPassword').post(authController.resetPassword);

userRouter.route('/').get(userController.getUsers);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser);

module.exports = userRouter;
