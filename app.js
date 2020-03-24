const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('mongoSanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController')

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

// --------- Global Middlewares ---------- //

// Setting some securety Headers
app.use(helmet());

// Dvelopment Login
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// limit requests from the same Address IP
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests, please try again in 1 hour!'
});

app.use('/api', limiter);

// Body Parser, Reading Data from body into req.body
app.use(express.json({
  limit: '10kb'
}));

// Data Sanitization Against NoSQL query Injection
app.use(mongoSanitize());

// Data Sanitization against XSS attacks
app.use(xss());

// Prevent parameter polution
app.use(hpp({
  whitelist: [
    'duration',
    'ratingsQuantity',
    'ratingsAverage',
    'maxGroupSize',
    'difficulty',
    'price'
  ]
}));

// Serving Static Files
app.use(express.static(`${__dirname}/public`));

// Test Middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);

  next();
});

// ------- ROUTES --------- //
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// Unhandled Routes
app.all('*', (req, res, next) => {  
  next(new AppError(`Can't find ${req.originalUrl} on this Server! `, 404));
});

app.use(globalErrorHandler);

module.exports = app;