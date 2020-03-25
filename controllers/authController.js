const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const sendEmail = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
}

// Create And Send Token using cookie
const createAndSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now + process.env.JWT_COOKIE_EXPIRES_IN *24 * 60 * 60 * 1000),
    httpOnly: true
  }

  if(process.env.NODE_ENV === 'production ') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);

  // Remove password from the output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
}

exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create(req.body);

  createAndSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const {email, password} = req.body;
  
  // Check emal && password Exist
  if(!email || !password) {
    return next(new AppError('Please Enter a Valid Email and Password', 400));
  }

  // Check if user Exist && Password is correct
  const user = await User.findOne({ email }).select('+password');

  if(!user || !(await  user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect Email or Password!', 401));
  }

  // If Everything is okay, Send token To the Cleint
  createAndSendToken(user, 200, res);
});

// Protect authentication requred routs
exports.protect = catchAsync(async (req, res, next) => {

  // Get Token && Check if Exist
  let token;
  if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if(!token) {
    return next(new AppError('Please Login To Get Access', 401));
  }

  // Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Chech if User Still Exist
  const currentUser = await User.findById(decoded.id);
  if(!currentUser) {
    return next(new AppError('The Token Of This User No Longer Exist', 401));
  }

  // Check If User Change Password After The token issued
  if(currentUser.changedPasswordAfter(decoded.iat)) {
    return next(new AppError('User Recently Changed Password, Please Login Again', 401));
  }

  // Garante Access to Protected Routs.
  req.user = currentUser;
  next();
});

// Athorisation Middlware
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles is an array ['admin', 'lead-guide'], role now is 'user'
    if(!roles.includes(req.user.role)) {
      return next(new AppError('You dont Have permition to porform this action', 403));
    }

    next();
  }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on posted email
  const user = await User.findOne({ email: req.body.email });
  if(!user) {
    return next(new AppError('No user with that email adress', 404));
  }

  // Generate random reset token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Send it user's Email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resrtPassword/${resetToken}`;

  const message = `Forget your password? Submit PATCH request with you new password and password confirm to: ${resetURL}.\n If ypou didnt forget your password please ignore this message!`;

  try {
  await sendEmail({
    email: user.email,
    subject: 'Your password reste token (Valid for 10 min)',
    message
  });

  res.status(200).json({
    status: 'success',
    message: 'Token send to email!'
  });
} catch (err) {
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save({ validateBeforeSave: false });

  return next(new AppError('There was an error sending this email, please try again later.', 500));
}

});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get User base on token
  const hashedPassword = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

  //  If token not expired and there is a user set the new password
  if(!user) {
    return next(new AppError('Token is invalid or has expired.'));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // Update chnagedPasswordAt property for the user 
  

  // Log the user in, send JWT
  createAndSendToken(user, 200, res);

});

// Update User Password when his login 
exports.updatePassword = catchAsync(async(req, res, next) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('Your current password is wrong.', 401));
  }

  // 3) If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // User.findByIdAndUpdate will NOT work as intended!

  // Log User in, send JWT
  createAndSendToken(user, 200, res);

});