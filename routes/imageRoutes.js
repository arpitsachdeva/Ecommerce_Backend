const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const { imageUploader, updateImageGallery } = require("../controllers/imageGenerator");

router.post("/image", imageUploader);
router.put("/image/:id", updateImageGallery);

module.exports = router;