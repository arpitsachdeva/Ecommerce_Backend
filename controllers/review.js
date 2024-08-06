const Review = require('../models/review');
const Product = require('../models/product'); // Import Product model for validation
const User = require('../models/userModel');

// Add a new review
exports.addReview = async (req, res) => {
    try {
        const { product_id, rating, comment } = req.body;
        const {user_id} = req.user.id;

        const user = await User.findById(user_id);

        // Validate if the product exists
        const product = await Product.findById(product_id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found",
                status: 404,
            });
        }

        // Create a new review
        const review = new Review({
            product_id,
            rating,
            comment,
        });

        const savedReview = await review.save();

        return res.status(201).json({
            success: true,
            data: savedReview,
            message: "Review added successfully",
            status: 201,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            status: 500,
        });
    }
};

// Get reviews for a product
exports.getReviews = async (req, res) => {
    try {
        const { product_id } = req.params;

        // Fetch reviews for the given product
        const reviews = await Review.find({ product_id });

        if (reviews.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No reviews found for this product",
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            data: reviews,
            message: "Reviews fetched successfully",
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            status: 500,
        });
    }
};

// Update a review
exports.updateReview = async (req, res) => {
    try {
        const { review_id } = req.params;
        const { rating, comment } = req.body;

        const {user_id} = req.user.id;

        const user = await User.findById(user_id);


        // Update the review
        const updatedReview = await Review.findByIdAndUpdate(
            review_id,
            { rating, comment, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            data: updatedReview,
            message: "Review updated successfully",
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            status: 500,
        });
    }
};

// Delete a review
exports.deleteReview = async (req, res) => {
    try {
        const { review_id } = req.params;

        // Delete the review
        const deletedReview = await Review.findByIdAndDelete(review_id);

        if (!deletedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found",
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
            status: 200,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
            status: 500,
        });
    }
};
