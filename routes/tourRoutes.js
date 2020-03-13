const express = require('express');
const tourCnotroller = require('./../controllers/tourController');

const router = express.Router();

router.route('/top-5-tours').get(tourCnotroller.aliasTopTours, tourCnotroller.getAllTours);

router.route('/tour-stats').get(tourCnotroller.getTourStats);
router.route('/monthly-plan/:year').get(tourCnotroller.getMonthlyPlan);

router
.route('/')
.get(tourCnotroller.getAllTours)
.post(tourCnotroller.createTour);

router
.route('/:id')
.get(tourCnotroller.getTour)
.patch(tourCnotroller.updateTour)
.delete(tourCnotroller.deleteTour);

module.exports = router;