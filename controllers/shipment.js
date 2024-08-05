const Shipment = require('../models/shipment');
const Order = require('../models/order');
const User = require('../models/userModel');
const Address = require('../models/address');
const Cart = require('../models/cart');
const Product = require('../models/product');

// Controller to assign a shipment
exports.assignShipment = async (req, res) => {
    try {
        const { order_id, shipping_service, courier, expected_delivery_date, tracking_url, warehouse_location } = req.body;
        const user_id = req.user.id;

        const order = await Order.findById(order_id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: 'Order not found',
                status: 404,
            });
        }

        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
                status: 404,
            });
        }

        const shipment = new Shipment({
            order_id,
            user_id,
            shipping_service,
            courier,
            expected_delivery_date,
            tracking_url,
            warehouse_location,
        });

        const savedShipment = await shipment.save();

        return res.status(201).json({
            success: true,
            status: 201,
            data: savedShipment,
            message: 'Shipment assigned successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message || 'Internal server error',
        });
    }
};

// Controller to update the shipment status
exports.updateShipmentStatus = async (req, res) => {
    try {
        const {shipment_status, shipped_at, delivered_at, actual_delivery_date } = req.body;
        const {shipment_id} = req.params;
        const shipment = await Shipment.findById(shipment_id);
        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found',
                status: 404,
            });
        }

        shipment.shipment_status = shipment_status || shipment.shipment_status;
        shipment.shipped_at = shipped_at || shipment.shipped_at;
        shipment.delivered_at = delivered_at || shipment.delivered_at;
        shipment.actual_delivery_date = actual_delivery_date || shipment.actual_delivery_date;
        shipment.updatedAt = Date.now();

        const updatedShipment = await shipment.save();

        return res.status(200).json({
            success: true,
            status: 200,
            data: updatedShipment,
            message: 'Shipment status updated successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message || 'Internal server error',
        });
    }
};

// Controller to get shipment details
exports.getShipmentDetails = async (req, res) => {
    try {
        const { shipment_id } = req.params;

        const shipment = await Shipment.findById(shipment_id)
            .populate({
                path: 'order_id',
                populate: [
                    {
                        path: 'orderBy',
                        select: 'username email',
                    },
                    {
                        path: 'shippingAddress',
                        populate: {
                            path: 'country',
                            select: 'name',
                        },
                        select: 'addressLine1 addressLine2 city state postalCode phone_number',
                    },
                    {
                        path: 'products',
                        populate: {
                            path: 'product_id',
                            model: 'Product',
                            select: 'title price description',
                        },
                        select: 'quantity amountPerPiece totalPriceOfCartItem totalDiscountofCartItem',
                    },
                ],
            })
            .populate('user_id', 'username email')
            .exec();

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found',
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: shipment,
            message: 'Shipment details retrieved successfully',
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message || 'Internal server error',
        });
    }
};