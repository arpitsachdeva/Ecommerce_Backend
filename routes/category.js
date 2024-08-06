const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { addCategory, updateCategory, deleteCategory, softDeleteCategory, getAllCategories, getCategoryById } = require("../controllers/category");
const checkAdmin = require("../middlewares/isAdmin");

router.post('/category', authMiddleware,checkAdmin , addCategory);
router.put('/category/:id',checkAdmin , updateCategory);
router.delete('/category/:id',checkAdmin , softDeleteCategory);
router.delete('/permanentdeleteCategory/:id',checkAdmin , deleteCategory);
router.get('/category', getAllCategories);
router.get('/category/:id', getCategoryById);


module.exports = router;