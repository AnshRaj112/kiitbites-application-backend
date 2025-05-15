// controllers/cartController.js
const { Cluster_Accounts, Cluster_Item } = require("../config/db");

// Get models from their respective clusters
const Account = Cluster_Accounts.model("Account");
const Inventory = Cluster_Item.model("Inventory");
const Item = Cluster_Item.model("Item");

// Helper to get foodCourtId for a given item
async function getFoodCourtIdForItem(itemId) {
  const inventory = await Inventory.findOne({ itemId });
  return inventory ? inventory.foodCourtId.toString() : null;
}

// ➕ Add item to cart
exports.addToCart = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const user = await Account.findById(userId).populate("cart.itemId");
    if (!user || !["user-standard", "user-premium"].includes(user.type)) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const inventory = await Inventory.findOne({ itemId });
    if (!inventory)
      return res.status(404).json({ error: "Item not found in inventory" });

    const foodCourtId = inventory.foodCourtId.toString();

    if (user.cart.length > 0) {
      const existingFoodCourtId = await getFoodCourtIdForItem(
        user.cart[0].itemId._id
      );
      if (existingFoodCourtId !== foodCourtId) {
        return res.status(409).json({
          error:
            "All items in cart must belong to the same foodcourt. Please clear cart to switch.",
        });
      }
    }

    const totalItems = user.cart.reduce(
      (sum, entry) => sum + entry.quantity,
      0
    );
    if (totalItems >= 5)
      return res
        .status(403)
        .json({ error: "Cart item limit reached (max 5 items)" });

    const cartItem = user.cart.find((i) => i.itemId._id.toString() === itemId);
    if (cartItem) {
      if (cartItem.quantity >= inventory.quantity) {
        return res
          .status(403)
          .json({ error: "Cannot add more than available quantity" });
      }
      cartItem.quantity += 1;
    } else {
      user.cart.push({ itemId, quantity: 1 });
    }

    await user.save();
    res.json({ message: "Item added to cart", cart: user.cart });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ➖ Remove one quantity
exports.removeOne = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const user = await Account.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const index = user.cart.findIndex((i) => i.itemId.toString() === itemId);
    if (index === -1)
      return res.status(404).json({ error: "Item not in cart" });

    if (user.cart[index].quantity > 1) {
      user.cart[index].quantity -= 1;
    } else {
      user.cart.splice(index, 1);
    }

    await user.save();
    res.json({ message: "Item quantity reduced", cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🗑 Remove entire item
exports.removeItem = async (req, res) => {
  const { userId, itemId } = req.body;

  try {
    const user = await Account.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.cart = user.cart.filter((i) => i.itemId.toString() !== itemId);
    await user.save();

    res.json({ message: "Item removed from cart", cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🛒 Get cart
exports.getCart = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId).populate("cart.itemId");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json({ cart: user.cart });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 🍟 Get extras from same foodcourt
exports.getExtras = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await Account.findById(userId);
    if (!user || user.cart.length === 0)
      return res.status(200).json({ extras: [] });

    const foodCourtId = await getFoodCourtIdForItem(user.cart[0].itemId);
    if (!foodCourtId)
      return res.status(404).json({ error: "Foodcourt not found" });

    const cartItemIds = user.cart.map((entry) => entry.itemId.toString());

    const inventory = await Inventory.find({ foodCourtId }).populate("itemId");

    const extras = inventory
      .filter((entry) => !cartItemIds.includes(entry.itemId._id.toString()))
      .map((entry) => ({
        item: entry.itemId,
        available: entry.quantity,
      }));

    res.json({ extras });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
