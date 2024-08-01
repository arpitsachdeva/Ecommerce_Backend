const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addToWishlist, deleteFromWishlist, wishlistDetails, wishlistList, deleteWishlist, deleteProductFromWishlist } = require("../controllers/wishlist");


router.post("/wishlist",authMiddleware ,addToWishlist);
router.delete("/deleteFromWishlist", authMiddleware, deleteFromWishlist);
router.get('/wishlist', authMiddleware, wishlistDetails);
router.get('/wishlistList',authMiddleware, wishlistList)
router.delete("/wishlist/:id",authMiddleware ,deleteWishlist);
router.delete("/deleteProductFromWishlist/:id", authMiddleware, deleteProductFromWishlist);
// router.get("/cart",authMiddleware ,getAllCartItems);


module.exports = router;