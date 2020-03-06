const express = require('express');
const morgan = require('morgan');

const tourRouter = require('./routes/tourRoutes');
const 

userRouter = require('./routes/userRoutes');

const app = express();

// -------- MIDDLEWARES ----------- //
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());

// Costum Middleware
// app.use((req, res, next) => {
//   console.log('Hello from the Middleware');
//   next();
// });

// app.use((req, res, next) => {
//   req.requestTime = new Date().toISOString;
//   next();
// });


// ------- Routs --------- //
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
 

module.exports = app;