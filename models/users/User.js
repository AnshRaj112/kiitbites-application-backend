const mongoose = require("mongoose");
const { Cluster_User } = require('../../config/db');

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String },
  gender: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  access: {
    type: String,
    enum: ['user-standard', 'user-premium', 'admin'],
    default: 'user-standard'
  },
  loginAttempts: { type: Number, default: 0 },
  lastLoginAttempt: { type: Date, default: null },
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  pastOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }]
}, { timestamps: true });

module.exports = Cluster_User.model('User', UserSchema);
