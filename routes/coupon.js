const express = require("express");
const router = express.Router();
const {
    addCoupon,
    updateCoupon,
    getCoupon,
    getAllCoupons,
    deleteCoupon,
    applyCoupon
} = require("../controllers/coupon");

const authMiddleware = require("../middlewares/authMiddleware");
const checkAdmin = require("../middlewares/isAdmin");

router.post("/coupons",authMiddleware,checkAdmin, addCoupon);
router.put("/coupons/:id", authMiddleware,checkAdmin, updateCoupon);
router.get("/coupons/:id", getCoupon);
router.get("/coupons", getAllCoupons);
router.delete("/coupons/:id",authMiddleware,checkAdmin, deleteCoupon);
router.post("/applyCoupon",authMiddleware, applyCoupon);

module.exports = router;
