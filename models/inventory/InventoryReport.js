const mongoose = require("mongoose");
const { Cluster_Inventory } = require("../../config/db");

const inventoryReportSchema = new mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    date: { type: Date, default: Date.now },

    retailEntries: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Retail" },
        openingQty: Number,
        closingQty: Number,
        soldQty: Number,
        _id: false,
      },
    ],

    produceEntries: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Produce" },
        soldQty: Number,
        _id: false,
      },
    ],

    rawEntries: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "Raw" },
        openingQty: Number,
        closingQty: Number,
        _id: false,
      },
    ],

    itemReceived: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "itemReceived.kind",
        },
        kind: { type: String, enum: ["Retail", "Produce", "Raw"] },
        quantity: Number,
        _id: false,
        date: { type: Date, default: Date.now },
      },
    ],

    itemSend: [
      {
        itemId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "itemProduced.kind",
        },
        kind: { type: String, enum: ["Retail", "Produce", "Raw"] },
        quantity: Number,
        _id: false,
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true } // correct place for this
);
const InventoryReport = Cluster_Inventory.model(
  "InventoryReport",
  inventoryReportSchema
);

module.exports = InventoryReport;
