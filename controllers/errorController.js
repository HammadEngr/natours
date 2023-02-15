const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid path ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const message = `Duplicate name: "${err.keyValue.name}", use any other name`;
  return new AppError(message, 404);
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');

  return new AppError(`Invalid inputs: ${message}`, 400);
};

const handleJWTerror = () =>
  new AppError('inavlid token, plz login again', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired, login again', 401);

const sendErrorDev = (err, res) => {
  console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 😎', err);
    res.status(500).json({
      status: 'Error',
      message: 'something went wrong',
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;

  err.status = err.status || 'Error';

  err.message = err.message || 'Something went wrong';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);

    if (error.name === 'CastError') error = handleCastErrorDB(error);

    if (error.code === 11000) error = handleDuplicateErrorDB(error);

    if (error.name === 'ValidationError') error = handleValidationErrorDB();

    if (error.name === 'JsonWebTokenError') error = handleJWTerror();

    if (error.name === 'TokenExpiredError')
      error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};
