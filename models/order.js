const mongoose = require('mongoose');


const orderSchema = new mongoose.Schema({
    orderBy:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User',
    },
    shippingAddress:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Address',
    },
    products:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Cart",
        }
    ],
    orderStatus:{
        type: String,
        enum:[
            "Not Processed",
            "Processing",
            "Dispatched",
            "Cancelled",
            "Delivered",
        ],
    },
    payment_method:{
        type: String,
    },
    total_amount:{
        type: Number,
    },
    total_discount: {
        type: Number,
    },
    orderTime:{
        type: Date,
    },
    createdAt:{
        type: Date,
        default: Date.now(),
    },
    updatedAt:{
        type: Date,
    }
});

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
