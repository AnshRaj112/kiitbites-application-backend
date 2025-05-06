const mongoose = require('mongoose');
const { Cluster_Order } = require('../../config/db');

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [{
    item: { type: mongoose.Schema.Types.ObjectId, ref: 'Item' },
    quantity: Number,
    isProduce: Boolean
  }],
  total: Number,
  status: { type: String, enum: ['ordered', 'completed'], default: 'ordered' },
  paymentStatus: { type: String, enum: ['paid', 'unpaid', 'pending'], default: 'unpaid' },
  foodCourtId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodCourt' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = Cluster_Order.model('Order', orderSchema);
