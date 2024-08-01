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

router.post("/coupons", addCoupon);
router.put("/coupons/:id", updateCoupon);
router.get("/coupons/:id", getCoupon);
router.get("/coupons", getAllCoupons);
router.delete("/coupons/:id", deleteCoupon);
router.post("/applyCoupon", applyCoupon);

module.exports = router;
