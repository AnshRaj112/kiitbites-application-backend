// controllers/cartController.js
const User = require("../models/account/User");
const Retail = require("../models/item/Retail");
const Produce = require("../models/item/Produce");
const cartUtils = require("../utils/cartUtils");

exports.addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, kind, quantity } = req.body;

    if (!itemId || !kind || !quantity || quantity <= 0) {
      return res
        .status(400)
        .json({ message: "itemId, kind, and positive quantity are required." });
    }

    // Check that kind is valid early
    if (!["Retail", "Produce"].includes(kind)) {
      return res.status(400).json({ message: "Invalid kind provided." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // Find existing cart item
    const existingItem = user.cart.find(
      (entry) =>
        entry.itemId.toString() === itemId.toString() && entry.kind === kind
    );

    // Calculate new total quantity for validation
    const newQuantity = existingItem
      ? Number(existingItem.quantity) + Number(quantity)
      : Number(quantity);

    console.log(
      `Adding to cart: kind=${kind}, quantity=${quantity}, existing=${
        existingItem ? existingItem.quantity : 0
      }, newQuantity=${newQuantity}`
    );

    // Validate the new total quantity against max allowed
    cartUtils.validateQuantity(kind, newQuantity);

    const item = await cartUtils.getItemDetails(itemId, kind);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const vendor = await cartUtils.findVendorWithItem(itemId, kind, item.uniId);
    if (!vendor)
      return res.status(404).json({ message: "Vendor for item not found." });

    if (user.vendorId && user.vendorId.toString() !== vendor._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cart can contain items from only one vendor." });
    }

    const availableQuantity = await cartUtils.getVendorInventory(
      vendor._id,
      kind,
      itemId
    );

    console.log(
      `Vendor availableQuantity for itemId=${itemId}: ${availableQuantity}`
    );

    if (kind === "Produce" && availableQuantity === 0) {
      return res
        .status(400)
        .json({ message: "Produce item is not available." });
    }

    if (kind === "Retail" && newQuantity > availableQuantity) {
      return res
        .status(400)
        .json({ message: `Only ${availableQuantity} units available.` });
    }

    if (existingItem) {
      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({ itemId, kind, quantity });
    }

    if (!user.vendorId) user.vendorId = vendor._id;

    await user.save();

    return res.status(200).json({ message: "Item added to cart successfully" });
  } catch (err) {
    console.error("Add to cart error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const cartItems = user.cart;

    const detailedCart = await Promise.all(
      cartItems.map(async (entry) => {
        const item = await cartUtils.getItemDetails(entry.itemId, entry.kind);
        if (!item) return null;

        return {
          itemId: item._id,
          name: item.name,
          image: item.image,
          unit: item.unit,
          price: item.price,
          quantity: entry.quantity,
          kind: entry.kind,
          totalPrice: item.price * entry.quantity,
        };
      })
    );

    return res.status(200).json({
      cart: detailedCart.filter(Boolean), // remove any nulls
      vendorId: user.vendorId,
    });
  } catch (err) {
    console.error("Get cart error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.increaseOne = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, kind } = req.body;

    if (!itemId || !kind) {
      return res.status(400).json({ message: "itemId and kind are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const item = await cartUtils.getItemDetails(itemId, kind);
    if (!item) return res.status(404).json({ message: "Item not found." });

    const vendor = await cartUtils.findVendorWithItem(itemId, kind, item.uniId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    if (user.vendorId && user.vendorId.toString() !== vendor._id.toString()) {
      return res
        .status(400)
        .json({ message: "Only one vendor allowed per cart." });
    }

    const availableQuantity = await cartUtils.getVendorInventory(
      vendor._id,
      kind,
      itemId
    );

    if (kind === "Produce" && availableQuantity === 0) {
      return res.status(400).json({ message: "Produce item unavailable." });
    }

    const existingItem = user.cart.find(
      (entry) =>
        entry.itemId.toString() === itemId.toString() && entry.kind === kind
    );

    if (!existingItem) {
      cartUtils.validateQuantity(kind, 1);
      user.cart.push({ itemId, kind, quantity: 1 });
    } else {
      const newQuantity = existingItem.quantity + 1;
      cartUtils.validateQuantity(kind, newQuantity);

      if (kind === "Retail" && newQuantity > availableQuantity) {
        return res
          .status(400)
          .json({ message: `Only ${availableQuantity} units available.` });
      }

      existingItem.quantity = newQuantity;
    }

    if (!user.vendorId) user.vendorId = vendor._id;

    await user.save();
    return res.status(200).json({ message: "Quantity increased" });
  } catch (err) {
    console.error("Increase one error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.decreaseOne = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, kind } = req.body;

    if (!itemId || !kind) {
      return res.status(400).json({ message: "itemId and kind are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const index = user.cart.findIndex(
      (entry) =>
        entry.itemId.toString() === itemId.toString() && entry.kind === kind
    );

    if (index === -1) {
      return res.status(404).json({ message: "Item not in cart." });
    }

    const currentQuantity = user.cart[index].quantity;

    if (currentQuantity === 1) {
      user.cart.splice(index, 1);
    } else {
      user.cart[index].quantity = currentQuantity - 1;
    }

    if (user.cart.length === 0) {
      user.vendorId = undefined;
    }

    await user.save();
    return res.status(200).json({ message: "Quantity decreased" });
  } catch (err) {
    console.error("Decrease one error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId, kind } = req.body;

    if (!itemId || !kind) {
      return res.status(400).json({ message: "itemId and kind are required." });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const originalLength = user.cart.length;

    user.cart = user.cart.filter(
      (entry) =>
        !(entry.itemId.toString() === itemId.toString() && entry.kind === kind)
    );

    if (user.cart.length === 0 && originalLength > 0) {
      user.vendorId = undefined;
    }

    await user.save();

    return res.status(200).json({
      message: "Item removed from cart",
    });
  } catch (err) {
    console.error("Remove item error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.getExtras = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    if (!user.cart.length || !user.vendorId) {
      return res
        .status(200)
        .json({ message: "Cart is empty. No extras available.", extras: [] });
    }

    const vendorId = user.vendorId;
    const vendor = await cartUtils.getVendorById(vendorId); // no populate

    if (!vendor) return res.status(404).json({ message: "Vendor not found." });

    const cartItemIds = user.cart.map((item) => item.itemId.toString());

    // Batch fetch Retail item IDs not in cart
    const retailItemIds = vendor.retailInventory
      .map((entry) => entry.itemId)
      .filter((id) => id && !cartItemIds.includes(id.toString()));

    // Batch fetch Produce item IDs not in cart
    const produceItemIds = vendor.produceInventory
      .map((entry) => entry.itemId)
      .filter((id) => id && !cartItemIds.includes(id.toString()));

    // Fetch items in parallel
    const [retailItems, produceItems] = await Promise.all([
      Retail.find({ _id: { $in: retailItemIds } }),
      Produce.find({ _id: { $in: produceItemIds } }),
    ]);

    const extras = [];

    retailItems.forEach((item) => {
      extras.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        kind: "Retail",
      });
    });

    produceItems.forEach((item) => {
      extras.push({
        itemId: item._id,
        name: item.name,
        price: item.price,
        image: item.image,
        kind: "Produce",
      });
    });

    res.status(200).json({
      message: extras.length
        ? "Extras from the same vendor."
        : "No extra items available.",
      extras,
    });
  } catch (err) {
    console.error("Get extras error:", err.message);
    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};
