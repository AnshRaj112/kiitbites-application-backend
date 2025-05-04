const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  password: { type: String },
  gender: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  access: {
    type: String,
    enum: ['user-standard', 'user-premium', 'admin', 'food court', 'refreshment', 'canteen', 'guest house', 'hospitality', 'main store'],
    default: 'user-standard'
  },
  loginAttempts: { type: Number, default: 0 },
  lastLoginAttempt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);
