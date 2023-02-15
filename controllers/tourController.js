const Tour = require('../model/tourModel');

const ApiFeatures = require('../utils/apiFeatures');

const AppError = require('../utils/appError');

const catchAsync = require('../utils/catchAsync');

// Get top 5 (middleware to manipulate request object)

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary';
  next();
};

// Get all tours
exports.getAllTours = catchAsync(async (req, res, next) => {
  const apiFeatures = new ApiFeatures(Tour, req.query)
    .filter()
    .sort()
    .fieldLimit()
    .paginate();
  const tours = await apiFeatures.query;

  res.status(201).json({
    status: 'Success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
});
// Create Tour
exports.createTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.create(req.body);
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Get single Tour
exports.getTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.id);

  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }

  res.status(200).json({
    status: 'succes',
    data: {
      tour,
    },
  });
});

// Update Tour
exports.updateTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: {
      tour,
    },
  });
});

// Delete Tour
exports.deleteTour = catchAsync(async (req, res, next) => {
  const tour = await Tour.findByIdAndDelete(req.params.id);
  if (!tour) {
    return next(new AppError('Tour not found', 404));
  }
  res.status(200).json({
    status: 'success',
    data: null,
  });
});

// Aggregation Pipeline
exports.getTourStats = catchAsync(async (req, res, next) => {
  const tours = await Tour.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } },
    },
    {
      $group: {
        _id: '$difficulty',
        numTours: { $sum: 1 },
        rating: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' },
      },
    },
    {
      $sort: { rating: -1 },
    },
  ]);
  res.status(200).json({
    status: 'succes',
    results: tours.length,
    tours: tours,
  });
});

// Get MonthlyPlan
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = +req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates',
    },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        count: { $sum: 1 },
        tours: { $push: '$name' },
      },
    },
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 },
    },
    {
      $sort: { count: -1 },
    },
  ]);
  res.status(200).json({
    status: 'succes',
    results: plan.length,
    data: {
      plan,
    },
  });
});
