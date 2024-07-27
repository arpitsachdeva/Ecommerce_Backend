const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addCategory, updateCategory, deleteCategory, softDeleteCategory, getAllCategories, getCategoryById } = require("../controllers/category");

router.post('/category', authMiddleware, addCategory);
router.put('/category/:id', updateCategory);
router.delete('/category/:id', softDeleteCategory);
router.delete('/permanentdeleteCategory/:id', deleteCategory);
router.get('/category', getAllCategories);
router.get('/category/:id', getCategoryById);


module.exports = router;