const mongoose = require("mongoose");
const { Cluster_Accounts } = require('../../config/db');

const accountSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user-standard', 'user-premium', 'admin', 'foodcourt', 'cafe', 'canteen', 'guesthouse', 'hospitality', 'main'],
    required: true,
    default: 'user-standard'
  },
  fullName: { type: String }, // Only for users
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  gender: { type: String }, // Optional for foodcourts
  isVerified: { type: Boolean, default: false },

  // Optional fields per type
  location: { type: String }, // For foodcourts/cafes
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], // For foodcourts
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }], // For users
  pastOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }], // For users

  loginAttempts: { type: Number, default: 0 },
  lastLoginAttempt: { type: Date, default: null },
}, { timestamps: true });

module.exports = Cluster_Accounts.model("Account", accountSchema);
