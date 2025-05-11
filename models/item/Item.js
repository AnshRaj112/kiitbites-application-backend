const mongoose = require('mongoose');
const { Cluster_Item } = require('../../config/db');
const { Cluster_Accounts } = require('../../config/db'); // Ensure Account model access

const itemSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['retail', 'produce'] },
  quantity: Number,
  unit: String,
  price: Number,
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
  }
});

module.exports = Cluster_Item.model('Item', itemSchema);
