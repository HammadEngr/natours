const User = require('../model/userModel');

const catchAsync = require('../utils/catchAsync');

const AppError = require('../utils/appError');

exports.getUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'succes',
    users: users.length,
    data: {
      users: users,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new AppError('user not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return next(new AppError('user not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null,
  });
});
