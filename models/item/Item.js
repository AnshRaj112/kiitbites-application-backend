const mongoose = require('mongoose');
const { Cluster_Item } = require('../../config/db');

const itemSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['retail', 'produce'] },
  quantity: Number,
  unit: String,
  price: Number,
  foodCourtId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodCourt' }
});

module.exports = Cluster_Item.model('Item', itemSchema);
