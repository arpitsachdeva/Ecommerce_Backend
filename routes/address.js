const express = require("express");
const { addAddress, updateAddress, getAddressDetails, getUserAddresses } = require("../controllers/address");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");



router.post('/address',authMiddleware ,addAddress);
router.put('/address/:id', authMiddleware, updateAddress);
router.get('/address/:id', authMiddleware, getAddressDetails);
router.get('/addresses', authMiddleware, getUserAddresses);

module.exports = router;