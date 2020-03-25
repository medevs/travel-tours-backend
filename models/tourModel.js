const mongoose = require('mongoose');
const slugify = require('slugify');

// const User = require('./userModel');
// const validator = require('validator');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A tour Must Have a Name'],
    unique: true,
    trim: true,
    maxLenght: [40, 'A tour name must have less than 40 characters'],
    minLenght: [10, 'A tour name must have more than 10 characters'],
    // validate: [validator.isAlpha, 'Tour name only contains characters']
  },
  slug: String,
  duration: {
    type: Number,
    required: [true, 'A tour Must Have a Duration']
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'A tour Must Have a group size']
  },
  difficulty: {
    type: String,
    required: [true, 'A tour Must Have a Difficulty'],
    enum: {
      values: ['easy', 'medium', 'difficult'],
      message: 'Difficulty is aither easy, medium, or difficult'
    } 
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
    min: [1, 'Ratings Average Must Be Above 1.0'],
    max: [5, 'Ratings Average Must Be Bellow 5.0'],
  },
  ratingsQuantity: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: [true, 'A tour Must Have a Price']
  },
  priceDiscount: {
    type: Number,
    validate: {
      validator: function (val) {
        return val < this.price;
      },
      message: 'Discount Price {{VALUE}} must be less than Mian price.'
    }
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'A tour Must Have a Summary']
  },
  description: {
    type: String,
    trim: true
  },
  imageCover: {
    type: String,
    required: [true, 'A tour Must Have a cover image']
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false
  },
  startDates: [Date],
  secretTour: {
    type: Boolean,
    default: false
  },
  startLocation: {
    type: {
      type: String,
      default: 'Point',
      enum: ['Point']
    },
    coordinates: [Number],
    address: String,
    description: String
  },
  locations: [
    {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point']
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number
    }
  ],
  guides: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    }
  ]
}, 
{
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// Virtual populate
tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id'
});

// Document Middleware - runs before .save() and .create()
tourSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', async function(next) {
//   const guidesPromise = this.guides.map(async id => await User.findById(id));
//   this.guides = await Promise.all(guidesPromise);

//   next();
// });

// tourSchema.post('save', function(doc, next) {
//   console.log(doc);
//   next(); 
// });

// Query Middleware
tourSchema.pre('/^find/', function(next) {
  // tourSchema.pre('find', function(next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  
  next();
});

tourSchema.pre('/^find/', function(next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt'
  });

  next();
});

tourSchema.post('/^find/', function(docs, next) {
  console.log(`Query Took: ${Date.now() - this.start} Ms`);
  // console.log(docs);
  next();
});


// Aggregation Middleware
tourSchema.pre('aggregate', function(next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  // console.log(this.pipeline());
  next();
});


const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
