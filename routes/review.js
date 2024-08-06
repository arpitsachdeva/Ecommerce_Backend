const express = require('express');
const router = express.Router();
const review = require('../controllers/review');
const authMiddleware = require("../middlewares/authMiddleware");

// Route to add a new review
router.post('/review',authMiddleware, review.addReview);

// Route to get reviews for a product
router.get('/review/:product_id', review.getReviews);

// Route to update a review
router.put('/review/:review_id',authMiddleware , review.updateReview);

// Route to delete a review
router.delete('/review/:review_id', authMiddleware, review.deleteReview);

module.exports = router;
