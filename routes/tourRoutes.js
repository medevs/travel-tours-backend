const express = require('express');
const tourCnotroller = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');


const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-5-tours')
  .get(
    tourCnotroller.aliasTopTours, 
    tourCnotroller.getAllTours);

router
  .route('/tour-stats')
  .get(tourCnotroller.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'),tourCnotroller.getMonthlyPlan);

router.route('/touts-within/:distance/center/:latlng/unit/:unit').get(tourCnotroller.getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(tourCnotroller.getDistances);

router
  .route('/')
  .get(tourCnotroller.getAllTours)
  .post(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourCnotroller.createTour);

router
  .route('/:id')
  .get(tourCnotroller.getTour)
  .patch(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'),tourCnotroller.updateTour)
  .delete(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide'), 
    tourCnotroller.deleteTour);

// Nested Routs (Adding  review for a tour)
// router.route('/:tourId/reviews').post(
//   authController.protect, 
//   authController.restrictTo('user'), 
//   reviewController.createReview()
// );

module.exports = router;