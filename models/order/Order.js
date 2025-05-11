const mongoose = require('mongoose');
const { Cluster_Order } = require('../../config/db');
const { Cluster_Accounts } = require('../../config/db');

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
  foodCourtId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Account',
    required: true,
    validate: {
      validator: async function(value) {
        const account = await Cluster_Accounts.model("Account").findById(value).select('type');
        const allowedTypes = ['admin', 'foodcourt', 'cafe', 'canteen', 'guesthouse', 'hospitality', 'main'];
        return account && allowedTypes.includes(account.type);
      },
      message: 'foodCourtId must reference an Account with a valid service type.'
    }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = Cluster_Order.model('Order', orderSchema);
