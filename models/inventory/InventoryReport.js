const mongoose = require('mongoose');
const { Cluster_Inventory } = require('../../config/db');

const inventoryReportSchema = new mongoose.Schema({
  foodCourtId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodCourt' },
  date: { type: Date, default: Date.now },
  entries: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    openingQty: Number,
    closingQty: Number
  }]
});

module.exports = Cluster_Inventory.model('InventoryReport', inventoryReportSchema);
