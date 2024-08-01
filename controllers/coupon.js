const Coupon = require("../models/coupon");
const Product = require("../models/product");
const Category = require("../models/category");

exports.addCoupon = async (req, res) => {
    try {
        const {title, code, description, type, amount, min_checkout_amount, max_coupon_amount, start_date, expiry_date, products, categories} = req.body;

        //Validate Products
        if(products){
            for(let i=0 ; i< products.length; i++){
                const product = await Product.findById(products[i]);
                if(!product) {
                    return res.status(400).json({
                        success: false,
                        status: 400,
                        message: `Product ID ${products[i]} does not exist`,
                    });
                }
            }
        }

        if(categories){
            for (let i = 0; i < categories.length; i++) {
                const category = await Category.findById(categories[i]);
                if (!category) {
                    return res.status(400).json({
                        success: false,
                        status: 400,
                        message: `Category ID ${categories[i]} does not exist`,
                    });
                }
            }
        }


        const coupon = new Coupon({
            title, code, description, type, amount, min_checkout_amount, max_coupon_amount, start_date, expiry_date, products, categories
        });

        const savedCoupon = await coupon.save();

        return res.status(201).json({
            success: true,
            status: 201,
            message: "Coupon created successfully",
            data: savedCoupon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

exports.updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const {title, code, description, type, amount, min_checkout_amount, max_coupon_amount, start_date, expiry_date, products, categories} = req.body;

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            id,
            {title, code, description, type, amount, min_checkout_amount, max_coupon_amount, start_date, expiry_date, products, categories, updatedAt: Date.now() },
            { new: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Coupon updated successfully",
            data: updatedCoupon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

exports.getCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const coupon = await Coupon.findById(id);

        if (!coupon) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Coupon retrieved successfully",
            data: coupon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

exports.getAllCoupons = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        const coupons = await Coupon.find().skip(skip).limit(parseInt(limit)).exec();

        const total = await Coupon.countDocuments();

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Coupons retrieved successfully",
            data: coupons,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

exports.deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedCoupon = await Coupon.findByIdAndDelete(id);

        if (!deletedCoupon) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Coupon not found",
            });
        }

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Coupon deleted successfully",
            data: deletedCoupon
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};

exports.applyCoupon = async (req, res) => {
    try {
        let {couponCode, checkoutAmount} = req.body;
        console.log(req.body);
        //Validate input
        
        checkoutAmount = parseInt(checkoutAmount);

        if(!couponCode || typeof checkoutAmount != 'number'){
            console.log("type of", typeof checkoutAmount);
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Invalid input. Please provide a valid coupon code and checkout amount."
            })
        }

        //Find the coupon by code
        const coupon = await Coupon.findOne({code: couponCode});
        console.log("coupon", coupon);
        if(!coupon){
            return res.status(400).json({
                success: false,
                status: 404,
                message: "Coupon not found",
            });
        }

        //Check if the coupon is expired
        if(coupon.expiry_date && coupon.expiry_date< new Date()) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Coupon is expired",
            })
        }
        
        //Check if the checkout amount meets the minimum requirement
        if(coupon.min_checkout_amount && checkoutAmount < coupon.min_checkout_amount){
            return res.status(400).json({
                success: false,
                status: 400,
                message: "Checkout amount is less than the minimum required amount for this coupon",
            });
        }

        //Calculate discount
        let discountAmount = 0;
        if(coupon.type === 'percentage'){
            discountAmount = (checkoutAmount * coupon.amount) / 100;
        }else if(coupon.type === 'flat'){
            discountAmount = coupon.amount;
        }

        //Ensure discount does not exceed max coupon amount
        if(coupon.max_coupon_amount && coupon.max_coupon_amount < discountAmount){
            discountAmount = coupon.max_coupon_amount;
        }

        //Calculate the final amount 
        const finalAmount = checkoutAmount - discountAmount;

        return res.status(200).json({
            success: true,
            status: 200,
            message: "Coupon applied successfully",
            data: finalAmount,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal server error",
        });
    }
};