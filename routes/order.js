const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addBrand, updateBrand, softDeleteBrand, deleteBrand, getAllBrands, getBrandById } = require("../controllers/brand");
const checkAdmin = require("../middlewares/isAdmin");
const { placeOrder, getAllOrders } = require("../controllers/order");

router.post('/order',authMiddleware ,placeOrder );
router.get('/order',authMiddleware ,getAllOrders)


module.exports = router;