// routes/inventoryRoutes.js
const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventoryController");

// Route to assign an item to a foodcourt
router.post("/assign", inventoryController.assignItemToFoodcourt);

// Route to update inventory for an item in a foodcourt
router.put("/", inventoryController.updateInventory);

// Route to get all items in a specific foodcourt's inventory
router.get("/:foodCourtId", inventoryController.getInventoryByFoodcourt);

module.exports = router;
