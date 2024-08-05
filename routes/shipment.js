const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipment');
const authMiddleware = require("../middlewares/authMiddleware");

// Assign a new shipment
router.post('/shipment', authMiddleware, shipmentController.assignShipment);

// Update shipment status
router.put('/shipment/:shipment_id', authMiddleware, shipmentController.updateShipmentStatus);

// Get shipment details
router.get('/shipment/:shipment_id', authMiddleware, shipmentController.getShipmentDetails);

module.exports = router;
