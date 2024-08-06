const express = require("express");
const router = express.Router();
const { addProduct, updateProduct, deleteProduct, getAllProducts, getProductDetails } = require("../controllers/product");
const { getAllCountryNames, getStatesByCountry, getCitiesByStateAndCountry } = require("../controllers/getLocation");
const authMiddleware = require("../middlewares/authMiddleware");
const checkAdmin = require("../middlewares/isAdmin");

//Write API requests here

router.post("/product" ,authMiddleware ,checkAdmin , addProduct );
router.put("/product/:id", authMiddleware ,checkAdmin ,updateProduct);
router.delete("/product/:id", authMiddleware , deleteProduct);
router.get("/product", getAllProducts);
router.get("/product/:id", getProductDetails)

//FOR MASTER TABLE OF COUNTRIES, STATES AND CITIES

router.get("/countries", getAllCountryNames);
router.get("/countries/:countryName/states", getStatesByCountry);
router.get("/countries/:countryName/states/:stateName/cities", getCitiesByStateAndCountry);

module.exports = router;