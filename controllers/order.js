const Order = require("../models/order");
const Product = require("../models/product");
const Cart = require("../models/cart");
const User = require('../models/userModel');
const Address = require('../models/address');
const Location = require('../models/location');


exports.placeOrder = async (req,res) => {
    try{

        const {address_id, products, payment_method, orderStatus} = req.body;

        const user_id = req.user.id;
        const user = await User.findById(user_id);
        if(!user){
            return res.status(404).json({
                success: false,
                message:"User is not logged in",
                status: 404,
            });
        }
 
        const addressOfUser = await Address.findById(address_id);
        if(!addressOfUser){
            return res.status(404).json({
                success: false,
                message:"No such address found",
                status: 404,
            });
        }        
       

        const cartItems = await Cart.find({_id: {$in: products }});
        console.log("Cart items", cartItems);
        
        if (cartItems.length !== products.length) {
            return res.status(404).json({
                success: false,
                message: "One or more cart items not found",
                status: 404,
            });
        }

        // Calculate total amount and total discount
        let total_amount = 0;
        let total_discount = 0;

        cartItems.forEach(cartItem => {
            total_amount += cartItem.totalPriceOfCartItem;
            total_discount += cartItem.totalDiscountofCartItem;
        });

        //Create order
        const order = new Order({
            orderBy: user_id,
            shippingAddress: address_id,
            products: cartItems.map(item => item._id),
            payment_method,
            total_amount,
            total_discount,
            orderStatus,
            orderTime: new Date()
            
        });

        const savedOrder = (await order.save());
        

        return res.status(200).json({
            success: true,
            status:200,
            data: savedOrder,
            message: "Order placed successfully",
        })

    }catch(error){
        return res.status(500).json({
            success: true,
            status: 500,
            message: error.message || "Internal server error",
        })
    }
}

exports.getAllOrders = async (req, res) => {
    try {
        // Fetch all orders and populate the required fields
        const orders = await Order.find()
            .populate({
                path: 'orderBy', // Populate user details
                select: 'username email', // Select fields to return from User
            })
            .populate({
                path: 'shippingAddress', // Populate address details
                select: 'addressLine1 addressLine2 city state country postalCode phone_number', // Select fields to return from Address
            })
            .populate({
                path: 'products', // Populate cart items
                populate: {
                    path: 'product_id', // Populate product details within cart items
                    select: 'title discountPrice netAmount', // Select fields from Product
                },
                select: 'total_amount, total_discount, orderTime', // Select fields from Cart
            })
            .select('orderStatus payment_method total_amount total_discount orderTime createdAt updatedAt') // Select fields to return from Order

        if (!orders.length) {
            return res.status(404).json({
                success: false,
                message: "No orders found",
                status: 404,
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            data: orders,
            message: "Orders retrieved successfully",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            status: 500,
            message: error.message || "Internal server error",
        });
    }
};