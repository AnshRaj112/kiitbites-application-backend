const mongoose = require('mongoose');
const { Cluster_FoodCourt } = require('../../config/db');

const foodCourtSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['foodcourt', 'cafe', 'canteen', 'guesthouse', 'hospitality', 'main'] },
  location: { type: String, default: null },
  inventory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }]
});

module.exports = Cluster_FoodCourt.model('FoodCourt', foodCourtSchema);
