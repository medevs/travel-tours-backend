const express = require('express');
const tourCnotroller = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.route('/top-5-tours').get(tourCnotroller.aliasTopTours, tourCnotroller.getAllTours);

router.route('/tour-stats').get(tourCnotroller.getTourStats);
router.route('/monthly-plan/:year').get(tourCnotroller.getMonthlyPlan);

router
.route('/')
.get(authController.protect, tourCnotroller.getAllTours)
.post(tourCnotroller.createTour);

router
.route('/:id')
.get(tourCnotroller.getTour)
.patch(tourCnotroller.updateTour)
.delete(
  authController.protect, 
  authController.restrictTo('admin', 'lead-guide'), 
  tourCnotroller.deleteTour
);

module.exports = router;