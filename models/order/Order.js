const mongoose = require("mongoose");
const { Cluster_Order } = require("../../config/db");
const { Cluster_Accounts } = require("../../config/db");

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  items: [
    {
      itemId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "items.kind",
      },
      kind: { type: String, required: true, enum: ["Retail", "Produce"] },
      quantity: { type: Number, default: 1 },
      _id: false,
    },
  ],
  total: Number,
  address: { type: String, required: true },
  status: {
    type: String,
    enum: [
      "ordered",
      "inProgress",
      "completed",
      "onTheWay",
      "delivered",
      "failed",
    ],
    default: "ordered",
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment",
  },
  paymentStatus: {
    type: String,
    enum: ["paid", "failed", "pending"],
    default: "pending",
  },

  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = Cluster_Order.model("Order", orderSchema);
