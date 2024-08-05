const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({

    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    productName:{
        type: String,
    },
    quantity:{
        type: Number,
    },
    amountPerPiece:{
        type: Number,
    },
    discountPerPiece:{
        type: Number,
    },
    totalPriceOfCartItem:{
        type: Number,
    },
    totalDiscountofCartItem:{
        type: Number,
    },
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
    }

});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;