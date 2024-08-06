const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment');
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdmin = require("../middlewares/isAdmin");

// Assign a new shipment
router.post('/shipment', authMiddleware,checkAdmin , shipmentController.assignShipment);

// Update shipment status
router.put('/shipment/:shipment_id', authMiddleware,checkAdmin ,shipmentController.updateShipmentStatus);

// Get shipment details
router.get('/shipment/:shipment_id', authMiddleware, shipmentController.getShipmentDetails);

module.exports = router;
