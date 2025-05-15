// routes/cartRoutes.js
const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");

router.post("/add", cartController.addToCart);
router.post("/remove-one", cartController.removeOne);
router.post("/remove-item", cartController.removeItem);
router.get("/:userId", cartController.getCart);
router.get("/extras/:userId", cartController.getExtras);

module.exports = router;
