const mongoose = require("mongoose");
const { Cluster_Order } = require("../../config/db");

const paymentSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  status: { type: String, enum: ["paid", "failed"] },
  paymentMethod: String,
  timestamp: { type: Date, default: Date.now },
  // Razorpay-specific fields
  razorpayOrderId: { type: String },
  razorpayPaymentId: { type: String },
});

module.exports = Cluster_Order.model("Payment", paymentSchema);
