const AppError = require('./../utils/AppError');

const handleCastErrorDB = err => {
 const message = `Invalid ${err.path}: ${err.value}.`;
 return new AppError(message, 400); 
}

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/[0]);
  const message = `Duplicate Field Value: ${value}. Please Use Another Value!`;
  return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid Input Data: ${errors.join(', ')}`;
  return new AppError(message, 400);
}

const handleJWTError = () => new AppError('Invalid Token Please Login Again', 401);

const handleJWTExpiredError = () => new AppError('Token Expired Please Login Again', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
}

const sendErrorProd = (err, res) => {
  // Operational Error, Trusted Error: Send Message To Cleint
  if(err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  // Programming or Other Error: Don't Show The Details To The Cleint
  } else {
    // Log Error
    console.log('Error!', err);

    // Send generic Error Message
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong!'
    });
  }
};

module.exports = (err, req, res, next) => {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if(process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if(process.env.NODE_ENV === 'production') {

    let error = { ...err };
    
    if(error.name === 'CastError') error = handleCastErrorDB(error);
    if(error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if(error.name === 'JsonWebTokenError') error = handleJWTError();
    if(error.name === 'TokenExpiredError') error = handleJWTExpiredError();
    
    sendErrorProd(error, res);
  }
};

