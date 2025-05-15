const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Create Razorpay order
router.post('/create-order', paymentController.createOrder);

// Verify Razorpay payment
router.post('/verify-payment', paymentController.verifyPayment);

module.exports = router;
