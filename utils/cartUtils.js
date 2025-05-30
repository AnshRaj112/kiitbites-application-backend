// utils/cartUtils.js
const Vendor = require("../models/account/Vendor");
const Retail = require("../models/item/Retail");
const Produce = require("../models/item/Produce");

const MAX_QUANTITY = {
  Retail: 10,
  Produce: 5,
};

function getItemModel(kind) {
  if (kind === "Retail") return Retail;
  if (kind === "Produce") return Produce;
  throw new Error("Invalid item kind");
}

async function getItemDetails(itemId, kind) {
  const Model = getItemModel(kind);
  return await Model.findById(itemId);
}

async function getVendorInventory(vendorId, kind, itemId) {
  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new Error("Vendor not found");

  if (kind === "Retail") {
    const item = vendor.retailInventory.find(
      (i) => i.itemId.toString() === itemId.toString()
    );
    return item && item.quantity > 0 ? item.quantity : 0;
  }

  if (kind === "Produce") {
    const item = vendor.produceInventory.find(
      (i) => i.itemId.toString() === itemId.toString()
    );
    return item && item.isAvailable === "Y" ? 1 : 0;
  }

  throw new Error("Invalid item kind for inventory check");
}

function validateQuantity(kind, quantity) {
  if (quantity <= 0) throw new Error("Quantity must be positive");
  if (!(kind in MAX_QUANTITY)) throw new Error("Invalid item kind");
  if (quantity > MAX_QUANTITY[kind]) {
    throw new Error(`Max quantity for ${kind} is ${MAX_QUANTITY[kind]}`);
  }
}

// Gets the university ID from the item to locate the vendor
async function getVendorIdFromItem(itemId, kind) {
  const Model = getItemModel(kind);
  const item = await Model.findById(itemId);
  if (!item) throw new Error("Item not found");
  return item.uniID || item.uniId; // use correct casing as per your schema
}

// Finds the actual vendor owning the item, matching university ID and inventory
async function findVendorWithItem(itemId, kind, uniId) {
  if (kind === "Retail") {
    return await Vendor.findOne({
      uniID: uniId,
      "retailInventory.itemId": itemId,
    });
  } else if (kind === "Produce") {
    return await Vendor.findOne({
      uniID: uniId,
      "produceInventory.itemId": itemId,
    });
  }
  return null;
}

async function getVendorById(vendorId) {
  // Just fetch vendor without populating as populate fields don't seem defined in schema
  return await Vendor.findById(vendorId);
}

module.exports = {
  getItemDetails,
  getVendorInventory,
  validateQuantity,
  findVendorWithItem,
  getVendorIdFromItem,
  getVendorById,
};
