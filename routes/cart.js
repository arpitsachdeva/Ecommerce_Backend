const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addCartItem, updateCartItem, deleteCartItem, getAllCartItems } = require("../controllers/cartItem");

router.post("/cart",authMiddleware ,addCartItem);
router.put("/cart", updateCartItem);
router.delete("/cart/:id", deleteCartItem);
router.get("/cart",authMiddleware ,getAllCartItems);

module.exports = router;