const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addBrand, updateBrand, softDeleteBrand, deleteBrand, getAllBrands, getBrandById } = require("../controllers/brand");
const checkAdmin = require("../middlewares/isAdmin");

router.post('/brand',authMiddleware ,addBrand );
router.put('/brand/:id',authMiddleware, updateBrand);
router.delete('/brand/:id',authMiddleware, checkAdmin, softDeleteBrand);
router.delete('/permanentdeleteBrand/:id',authMiddleware, deleteBrand);
router.get('/brand',authMiddleware, getAllBrands);
router.get('/brand/:id',authMiddleware, getBrandById);


module.exports = router;