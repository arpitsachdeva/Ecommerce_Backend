const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addBrand, updateBrand, softDeleteBrand, deleteBrand, getAllBrands, getBrandById } = require("../controllers/brand");
const checkAdmin = require("../middlewares/isAdmin");

router.post('/brand',authMiddleware,checkAdmin ,addBrand );
router.put('/brand/:id',authMiddleware,checkAdmin , updateBrand);
router.delete('/brand/:id',authMiddleware, checkAdmin, softDeleteBrand);
router.delete('/permanentdeleteBrand/:id',checkAdmin ,authMiddleware, deleteBrand);
router.get('/brand',authMiddleware, getAllBrands);
router.get('/brand/:id',authMiddleware, getBrandById);


module.exports = router;