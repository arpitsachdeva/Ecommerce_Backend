const mongoose = require("mongoose");

const wishlistSchema = new mongoose.Schema({
    name:{
        type: String,
    },
    user_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    product_ids:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },
    updatedAt:{
        type: Date,
    }

});

const Wishlist = mongoose.model("Wishlist", wishlistSchema);
module.exports = Wishlist;