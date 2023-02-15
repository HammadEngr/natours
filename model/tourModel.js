const mongoose = require('mongoose');

const slugify = require('slugify');

const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'tour name is required'],
      unique: true,
      trim: true,
      maxLength: [40, 'Tour name must have less then 40 characters'],
      minLength: [10, 'Tour name must have 10 or above characters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'tour must have duration'],
    },
    difficulty: {
      type: String,
      required: [true, 'tour difficulty must be defined'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: 'Difficulty can be either easy, medium or hard',
      },
    },
    price: {
      type: Number,
      required: [true, 'tour must hava price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function () {
          return this.priceDiscount < this.price;
        },
        message: 'Price discount must be less then actual price',
      },
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'group size must be defined'],
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be atleast 1'],
      max: [5, 'Rating should not exceed 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    summary: {
      type: String,
      required: [true, 'tour must have summary'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have images'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secret: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Virtuals
// mongoose.set({ toJSON: { virtuals: true }, toObject: { virtuals: true } });
tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});
// Document Middleware
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// Query Middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secret: { $ne: true } });
  next();
});

// Aggregation Middleware
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secret: { $ne: true } } });
  next();
});
const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
