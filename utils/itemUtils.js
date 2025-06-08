// src/utils/itemUtils.js

const mongoose = require("mongoose");
const Vendor = require("../models/account/Vendor");
const Uni = require("../models/account/Uni");
const Retail = require("../models/item/Retail");
const Produce = require("../models/item/Produce");

/**
 * Safely convert a string to ObjectId.
 * Throws if the string is not a valid ObjectId.
 */
function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error(`Malformed ObjectId "${id}".`);
  }
  return new mongoose.Types.ObjectId(id);
}

/**
 * Verify that the vendor exists, and that in its Uni.vendors array,
 * there is an entry { vendorId: <this vendor>, isAvailable: "Y" }.
 *
 * Throws if Uni not found, or vendor not listed or marked unavailable.
 */
async function assertVendorAvailableInUni(vendorId, uniId) {
  const uni = await Uni.findById(uniId).select("vendors").lean();
  if (!uni) {
    throw new Error(`Uni with ID ${uniId} not found.`);
  }

  const entry = (uni.vendors || []).find(
    (v) => String(v.vendorId) === String(vendorId)
  );
  if (!entry) {
    throw new Error(`Vendor ${vendorId} not registered under Uni ${uniId}.`);
  }
  if (entry.isAvailable !== "Y") {
    throw new Error(
      `Vendor ${vendorId} is currently unavailable under Uni ${uniId}.`
    );
  }
}

/**
 * getItemsForVendorId(vendorId):
 *
 * 1. Fetch vendor → ensure they are available under their Uni.
 * 2. Filter out any retailInventory entries with quantity ≤ 0,
 *    and any produceInventory entries where isAvailable !== "Y".
 * 3. Batch‐fetch exactly those item documents (using _id ∈ [ ... ]).
 * 4. Return only the minimal fields needed by the frontend:
 *      • itemId,
 *      • name,
 *      • price,
 *      • quantity (for retail),
 *      • (no type/unit/image unless strictly necessary—remove them if not used).
 */
async function getItemsForVendorId(vendorId) {
  const vOid = toObjectId(vendorId);

  // 1. Fetch vendor with only the fields we need
  const vendor = await Vendor.findById(vOid)
    .select("fullName uniID retailInventory produceInventory")
    .lean();
  if (!vendor) throw new Error(`Vendor ${vendorId} not found.`);

  // 2. Verify that this vendor is available under its Uni
  await assertVendorAvailableInUni(vOid, vendor.uniID);

  // 3. Filter out any retail entries with quantity ≤ 0
  const retailEntries = (vendor.retailInventory || []).filter(
    (entry) => entry.quantity > 0
  );
  //    Filter out any produce entries where isAvailable !== "Y"
  const produceEntries = (vendor.produceInventory || []).filter(
    (entry) => entry.isAvailable === "Y"
  );

  // 4. Collect the unique item IDs for batch lookup
  const retailItemIds = retailEntries.map((e) => String(e.itemId));
  const produceItemIds = produceEntries.map((e) => String(e.itemId));

  // 5. Batch‐fetch item docs from Retail & Produce in parallel
  //    We only select the fields we actually need: name + price.
  //    If your frontend also needs type, unit, or image, you can add them here.
  const [retailDocs, produceDocs] = await Promise.all([
    Retail.find({
      _id: { $in: retailItemIds.map(toObjectId) },
      uniId: vendor.uniID,
    })
      .select("name price image type")
      .lean(),
    Produce.find({
      _id: { $in: produceItemIds.map(toObjectId) },
      uniId: vendor.uniID,
    })
      .select("name price image type")
      .lean(),
  ]);

  // 6. Build quick lookup maps from the fetched docs
  const retailMap = new Map(retailDocs.map((doc) => [String(doc._id), doc]));
  const produceMap = new Map(produceDocs.map((doc) => [String(doc._id), doc]));

  // 7. Build the minimal response arrays:
  //    • For each retail entry: include itemId, name, price, quantity.
  const retailItems = retailEntries
    .map(({ itemId, quantity }) => {
      const doc = retailMap.get(String(itemId));
      if (!doc) return null; // If not found in DB, skip
      return {
        itemId: doc._id,
        name: doc.name,
        price: doc.price,
        quantity, // how many units left
        image: doc.image,
        type: doc.type
      };
    })
    .filter(Boolean);

  //    • For produce: include itemId, name, price
  const produceItems = produceEntries
    .map(({ itemId }) => {
      const doc = produceMap.get(String(itemId));
      if (!doc) return null;
      return {
        itemId: doc._id,
        name: doc.name,
        price: doc.price,
        image: doc.image,
        type: doc.type
      };
    })
    .filter(Boolean);

  // 8. Return only what is needed by the frontend
  return {
    foodCourtName: vendor.fullName,
    retailItems,
    produceItems,
  };
}

/**
 * getVendorsByItemId(itemKind, itemId):
 *
 * 1. Validate itemKind ∈ { "retail", "produce" }.
 * 2. Convert itemId → ObjectId; find all vendors that have this item in their inventory array.
 * 3. For each vendor found:
 *      • Assert vendor is available in its Uni.
 *      • Pull out only the relevant inventory field (quantity or isAvailable)
 *      • Return an array of { vendorId, vendorName, uniID, inventoryValue }.
 *
 * We only select "fullName" + "uniID" + the inventory array field needed, so the DB reads minimal data.
 */
async function getVendorsByItemId(itemKind, itemId) {
  if (!["retail", "produce"].includes(itemKind)) {
    throw new Error(
      `Invalid itemKind "${itemKind}". Must be "retail" or "produce".`
    );
  }

  const oid = toObjectId(itemId);
  const matchField =
    itemKind === "retail" ? "retailInventory" : "produceInventory";

  // 1. Find vendors whose inventory array contains this itemId
  //    Only select the minimal fields we need: fullName, uniID, and that inventory array field.
  const vendors = await Vendor.find({
    [matchField]: { $elemMatch: { itemId: oid } },
  })
    .select(`fullName uniID ${matchField}`)
    .lean();

  const results = [];
  for (const v of vendors) {
    try {
      // 2. Check if this vendor is marked available in its Uni
      await assertVendorAvailableInUni(v._id, v.uniID);

      // 3. Grab the matching inventory entry for this item
      const entry = (v[matchField] || []).find(
        (e) => String(e.itemId) === String(oid)
      );
      if (!entry) continue;

      // 4. Construct inventoryValue:
      //    • retail → { quantity: ... }
      //    • produce → { isAvailable: ... }
      const inventoryValue =
        itemKind === "retail"
          ? { quantity: entry.quantity || 0 }
          : { isAvailable: entry.isAvailable || "N" };

      results.push({
        vendorId: v._id,
        vendorName: v.fullName,
        uniID: v.uniID,
        inventoryValue,
      });
    } catch (err) {
      // If the vendor is not available in Uni or some other error, skip this vendor.
      continue;
    }
  }

  return results;
}

module.exports = {
  getItemsForVendorId,
  getVendorsByItemId,
};
