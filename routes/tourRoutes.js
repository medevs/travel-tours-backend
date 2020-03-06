const express = require('express');
const tourCnotroller = require('./../controllers/tourController');

const router = express.Router();

router.param('id', tourCnotroller.checkID);

router
.route('/')
.get(tourCnotroller.getAllTours)
.post(tourCnotroller.checkBody, tourCnotroller.createTour);

router
.route('/:id')
.get(tourCnotroller.getTour)
.patch(tourCnotroller.updateTour)
.delete(tourCnotroller.deleteTour);

module.exports = router;