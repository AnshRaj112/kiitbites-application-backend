const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartController");
const { authMiddleware } = require("../middleware/authMiddleware");
// for JWT verification

router.post("/add", authMiddleware, cartController.addToCart);
router.get("/", authMiddleware, cartController.getCart);
router.post("/add-one", authMiddleware, cartController.increaseOne);
router.post("/remove-one", authMiddleware, cartController.decreaseOne);
router.post("/remove-item", authMiddleware, cartController.removeItem);
router.get("/extras", authMiddleware, cartController.getExtras);

// router.post("/pay", authMiddleware, cartController.placeOrder);

module.exports = router;
