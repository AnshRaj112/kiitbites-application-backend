const express = require("express");
const router = express.Router();
const foodcourtController = require("../controllers/foodCourtController");

// Foodcourt routes
router.post("/", foodcourtController.createFoodcourt);

module.exports = router;
