const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const shipmentSchema = new mongoose.Schema({
    order_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    shipment_status: {
        type: String,
        enum: ['Pending', 'Shipped', 'In Transit', 'Delivered', 'Cancelled'],
        default: 'Pending',
    },
    tracking_number: {
        type: String,
        unique: true,
        default: uuidv4, // Generate a unique tracking number
    },
    shipping_service: {
        type: String,
        required: true,
    },
    courier: {
        type: String,
        required: true,
    },
    shipped_at: {
        type: Date,
    },
    expected_delivery_date: {
        type: Date,
    },
    delivered_at: {
        type: Date,
    },
    actual_delivery_date: {
        type: Date,
    },
    tracking_url: {
        type: String,
    },
    warehouse_location: {
        type: String,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
    }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);
module.exports = Shipment;
