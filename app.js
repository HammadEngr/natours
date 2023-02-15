const express = require('express');

const app = express();

const morgan = require('morgan');

const globalErrorHandler = require('./controllers/errorController');

const AppError = require('./utils/appError');

// Development Logging
if (process.env.NODE_ENV === 'developmenr') {
  app.use(morgan('dev'));
}

const tourRoutes = require('./routes/tourRoutes');

const userRoutes = require('./routes/userRoutes');

app.use(express.json());

// Router Mounting
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);

// Handling undefined Routes
app.all('*', (req, res, next) => {
  // return next(new AppError());
  return next(new AppError(`Path ${req.originalUrl} not found`, 404));
});
// Gloabl Error Handling
app.use(globalErrorHandler);
module.exports = app;
