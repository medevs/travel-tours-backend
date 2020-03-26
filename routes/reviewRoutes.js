const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

// (mergeParams: true) gives accecs to the other routes
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route('/')
  .get(reviewController.getAllReviews)
  .post( 
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router.route('/:id')
  .get(reviewController.getReview)
  .patch(
    userController.restrictTo('user', 'admin'), 
    reviewController.updateReview)
  .delete(
    userController.restrictTo('user', 'admin'),
    reviewController.deleteReview);




module.exports = router;