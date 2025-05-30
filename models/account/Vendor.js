const mongoose = require("mongoose");
const { Cluster_Accounts } = require("../../config/db");

const vendorSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true },
    password: { type: String, required: true }, // hash this in pre-save hook
    location: { type: String },
    uniID: { type: mongoose.Schema.Types.ObjectId, ref: "Uni" },

    retailInventory: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Retail",
          required: true,
        },
        quantity: { type: Number, default: 0, required: true },
        _id: false,
      },
    ],

    produceInventory: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Produce",
          required: true,
        },
        isAvailable: {
          type: String,
          enum: ["Y", "N"],
          default: "Y",
          required: true,
        },
        _id: false,
      },
    ],

    lastLoginAttempt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = Cluster_Accounts.model("Vendor", vendorSchema);
