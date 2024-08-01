const mongoose = require("mongoose");


const couponSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description:{
        type: String,
    },
    type:{
        type: String,
        enum: ['flat', 'percentage'],
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    min_checkout_amount: {
        type: Number,
    },
    max_coupon_amount:{
        type: Number,
    },
    start_date:{
        type: Date,
    },
    expiry_date: {
        type: Date,
    },
    products:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    categories:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
