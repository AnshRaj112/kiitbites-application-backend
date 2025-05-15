// inventory.js
const mongoose = require("mongoose");
const { Cluster_Accounts } = require("../../config/db"); // Reference to Account model for foodcourts
const { Cluster_Item } = require("../../config/db"); // Reference to Item model for global items

const inventorySchema = new mongoose.Schema({
  foodCourtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: true,
    validate: {
      validator: async function (value) {
        const account = await Cluster_Accounts.model("Account")
          .findById(value)
          .select("type");
        const allowedTypes = [
          "foodcourt",
          "cafe",
          "canteen",
          "guesthouse",
          "hospitality",
          "main",
        ];
        return account && allowedTypes.includes(account.type);
      },
      message:
        "foodCourtId must reference an Account with a valid service type.",
    },
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Item",
    required: true,
  },
  quantity: { type: Number, required: true },
});

module.exports = Cluster_Item.model("Inventory", inventorySchema); // Use Cluster_Item cluster
