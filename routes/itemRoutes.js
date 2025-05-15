// routes/itemRoutes.js
const express = require("express");
const router = express.Router();
const itemController = require("../controllers/itemController");

// Route to create a new item in the global catalog
router.post("/", itemController.createItem);

// Route to get all items in the global catalog
router.get("/", itemController.getItems);

module.exports = router;
