const { Cluster_Item } = require("../config/db");
const { Cluster_Accounts } = require("../config/db");
const Inventory = require("../models/item/inventory"); // Using the correct cluster for Inventory

// Assign item to foodcourt
exports.assignItemToFoodcourt = async (req, res) => {
  try {
    const { foodCourtId, itemId, quantity, unit } = req.body;

    // ✅ Check if foodCourtId exists and is a valid type
    const foodCourt = await Cluster_Accounts.model("Account")
      .findById(foodCourtId)
      .select("type");
    const allowedTypes = [
      "foodcourt",
      "cafe",
      "canteen",
      "guesthouse",
      "hospitality",
      "main",
    ];

    if (!foodCourt || !allowedTypes.includes(foodCourt.type)) {
      return res.status(400).json({ message: "Invalid foodcourt type" });
    }

    // ✅ Check if itemId exists in the Item collection
    const item = await Cluster_Item.model("Item").findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // ✅ Optional: Check if the inventory already exists to avoid duplicate
    const existingInventory = await Inventory.findOne({ foodCourtId, itemId });
    if (existingInventory) {
      return res.status(400).json({
        message:
          "Item already assigned to this foodcourt. Consider updating instead.",
      });
    }

    // ✅ Create new inventory entry
    const newInventory = new Inventory({ foodCourtId, itemId, quantity, unit });
    await newInventory.save();

    // ✅ Also update the foodcourt's inventory array
    const foodcourtDoc = await Cluster_Accounts.model("Account").findById(
      foodCourtId
    );
    foodcourtDoc.inventory.push(itemId);
    await foodcourtDoc.save();

    res.status(201).json({
      message: "Item assigned to foodcourt successfully",
      inventory: newInventory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error assigning item to foodcourt",
      error: err.message,
    });
  }
};
// Update inventory
exports.updateInventory = async (req, res) => {
  try {
    const { foodCourtId, itemId, quantity } = req.body;

    // First check if the inventory entry exists
    const existingInventory = await Inventory.findOne({ foodCourtId, itemId });

    if (!existingInventory) {
      return res.status(404).json({
        message: "Inventory entry not found for this foodcourt and item",
      });
    }

    // Update the quantity
    existingInventory.quantity = quantity;
    const updatedInventory = await existingInventory.save();

    res.status(200).json({
      message: "Inventory updated successfully",
      inventory: updatedInventory,
    });
  } catch (err) {
    res.status(500).json({
      message: "Error updating inventory",
      error: err.message,
    });
  }
};

// Get inventory by foodcourt
exports.getInventoryByFoodcourt = async (req, res) => {
  try {
    const { foodCourtId } = req.params;
    const inventory = await Inventory.find({ foodCourtId }).populate(
      "itemId",
      "name price unit"
    );
    res.status(200).json(inventory);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching inventory", error: err.message });
  }
};
