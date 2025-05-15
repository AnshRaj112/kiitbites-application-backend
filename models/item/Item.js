// item.js
const mongoose = require("mongoose");
const { Cluster_Item } = require("../../config/db"); // Using the clustered database

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    enum: ["retail", "produce"],
    required: true,
  },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, required: true },
});

module.exports = Cluster_Item.model("Item", itemSchema); // Use Cluster_Item cluster
