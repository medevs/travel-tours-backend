const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

// Filter Filefs to update 
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if(allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
}

exports.getAllUsers = catchAsync(async(req, res, next) => {
  const users = await User.find();

  // Send Respons
  res.status(200).json({
    status: 'success',
    result: users.length,
    data: {
      users
    }
  });
});

// Upadet user data (hi's data)
exports.updateMe = catchAsync(async(req, res, next) => {
  // create error if user posts password tada
  if(req.body.password || req.body.passwordConfirm) {
    return next(new AppError('This Rout updates unly data', 400));
  }

  // Filtered out unwanted fields to not update
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.params.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet.'
  });
}

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet.'
  });
}

exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet.'
  });
}

exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Route not defined yet.'
  });
}