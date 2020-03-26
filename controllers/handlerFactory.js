const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/AppError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
  
    if(!doc) {
      return next(new AppError('No document found with this ID', 404))
    }
  
    res.status(200).json({
      status: 'success',
      data: null
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
  
    if(!doc) {
      return next(new AppError('No document found with this ID', 404))
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.createOne = Model => 
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
  
    res.status(201).json({
      status: 'success',
      data: { 
        data: doc
      } 
    });
  
  });

exports.getOne = (Model, populateOptions) => 
  catchAsync(async (req, res, next) => {

    let query = Model.findById(req.params.id);

    if(populateOptions) query = query.populate(populateOptions);

    const doc = await query;
  
    if(!doc) {
      return next(new AppError('No docment found with this ID', 404))
    }
  
    res.status(200).json({
      status: 'success',
      data: {
        data: doc
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {

    // Allow Nested Get Reviews On Tour
    let filter = {};
    if(req.params.tourId) filter = { tour: req.params.tourId };

    // Execute The Query
    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().paginate();
    const doc = await features.query;
  
    // Send Respons
    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: {
        data: doc
      }
    });
  });
